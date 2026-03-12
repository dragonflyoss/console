#!/bin/bash

set -e

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONFIG_FILE="$PROJECT_ROOT/scripts/git/config.json"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查 jq 是否安装
check_jq() {
    if ! command -v jq &> /dev/null; then
        log_error "jq 未安装，请先安装 jq"
        log_info "安装命令: brew install jq (macOS)"
        exit 1
    fi
}

# 读取配置
read_config() {
    if [[ ! -f "$CONFIG_FILE" ]]; then
        log_error "配置文件不存在: $CONFIG_FILE"
        exit 1
    fi

    GITHUB_REMOTE=$(jq -r '.githubRemote' "$CONFIG_FILE")
    INTERNAL_REMOTE=$(jq -r '.internalRemote' "$CONFIG_FILE")
    MAIN_BRANCH=$(jq -r '.mainBranch' "$CONFIG_FILE")
}

# 验证远程仓库
verify_remotes() {
    log_info "验证远程仓库配置..."

    if ! git remote get-url "$GITHUB_REMOTE" &> /dev/null; then
        log_error "GitHub 远程仓库 '$GITHUB_REMOTE' 不存在"
        exit 1
    fi

    if ! git remote get-url "$INTERNAL_REMOTE" &> /dev/null; then
        log_error "内部远程仓库 '$INTERNAL_REMOTE' 不存在"
        exit 1
    fi

    log_success "远程仓库验证通过"
}

# 检查分支是否包含非公司邮箱提交
check_branch_email() {
    local remote=$1
    local branch=$2

    # 检查是否有非公司邮箱的提交
    local bad_commits=$(git log "$remote/$branch" --format="%ae" | grep -v "@digital-engine.com$" | head -1)

    if [[ -n "$bad_commits" ]]; then
        return 1
    fi

    return 0
}

# 获取远程分支列表
get_remote_branches() {
    local remote=$1
    git branch -r | grep "$remote/" | grep -v 'HEAD' | sed "s|$remote/||" | grep -v '^[[:space:]]*$'
}

# 同步分支
sync_branch() {
    local branch=$1
    local current_branch=$(git branch --show-current)

    # 检查 origin 是否存在该分支
    if git show-ref --verify --quiet "refs/remotes/$INTERNAL_REMOTE/$branch"; then
        log_info "  - 内部仓库已存在分支: $branch (跳过)"
        return 0
    fi

    # 检查邮箱合规性
    if ! check_branch_email "$GITHUB_REMOTE" "$branch"; then
        log_warning "  - 分支包含非公司邮箱提交，跳过同步: $branch"
        return 0
    fi

    log_info "  - 同步分支: $branch"

    # 获取 origin2 的分支
    git fetch "$GITHUB_REMOTE" "$branch" 2>/dev/null || {
        log_error "  - 获取分支失败: $branch"
        return 1
    }

    # 创建本地分支
    git checkout "$branch" 2>/dev/null || {
        git checkout -b "$branch" "$GITHUB_REMOTE/$branch" || {
            log_error "  - 创建本地分支失败: $branch"
            return 1
        }
    }

    # 推送到内部仓库
    if git push "$INTERNAL_REMOTE" "$branch"; then
        log_success "  - 成功同步分支: $branch"
    else
        log_error "  - 推送分支失败: $branch"
        return 1
    fi
}

# 主函数
main() {
    cd "$PROJECT_ROOT"

    echo ""
    echo "========================================"
    echo "  Dragonfly Console 安全分支同步工具"
    echo "========================================"
    echo ""
    echo "注意: 此脚本会跳过包含非公司邮箱的分支"
    echo ""

    check_jq
    read_config
    verify_remotes

    log_info "从 $GITHUB_REMOTE 获取所有分支..."

    # 获取 origin2 所有分支
    branches=$(get_remote_branches "$GITHUB_REMOTE")

    if [[ -z "$branches" ]]; then
        log_warning "没有找到任何远程分支"
        exit 0
    fi

    # 统计信息
    local total=0
    local synced=0
    local skipped=0
    local failed=0

    # 过滤掉 main 分支（最后处理）
    local main_branch=""
    local other_branches=()

    for branch in $branches; do
        if [[ "$branch" == "$MAIN_BRANCH" ]]; then
            main_branch="$branch"
        else
            other_branches+=("$branch")
        fi
    done

    # 先同步其他分支
    for branch in "${other_branches[@]}"; do
        total=$((total + 1))
        if sync_branch "$branch"; then
            synced=$((synced + 1))
        else
            failed=$((failed + 1))
        fi
    done

    # 最后同步 main 分支
    if [[ -n "$main_branch" ]]; then
        total=$((total + 1))
        if sync_branch "$main_branch"; then
            synced=$((synced + 1))
        else
            failed=$((failed + 1))
        fi
    fi

    # 返回到原始分支
    git checkout main 2>/dev/null || true

    # 显示统计信息
    echo ""
    echo "========================================"
    echo "  同步完成统计"
    echo "========================================"
    echo -e "总计分支数: ${GREEN}$total${NC}"
    echo -e "成功同步:   ${GREEN}$synced${NC}"
    echo -e "跳过分支:   ${YELLOW}$skipped${NC}"
    echo -e "同步失败:   ${RED}$failed${NC}"
    echo "========================================"
    echo ""

    if [[ $failed -gt 0 ]]; then
        log_warning "部分分支同步失败，请检查错误信息"
        exit 1
    else
        log_success "分支同步完成！"
        exit 0
    fi
}

main "$@"