#!/bin/bash
# 批量修复 Git 提交作者信息

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# 目标作者信息
TARGET_NAME="杨佳乐"
TARGET_EMAIL="yjl516914@digital-engine.com"

log_info "开始批量修复提交作者信息..."
log_info "目标作者: $TARGET_NAME <$TARGET_EMAIL>"
log_warning "这将修改 Git 历史，请确认要继续！"
read -p "是否继续? (yes/no): " confirm

if [[ "$confirm" != "yes" ]]; then
    log_info "操作已取消"
    exit 0
fi

# 使用 git filter-branch 批量修改作者
export FILTER_BRANCH_SQUELCH_WARNING=1
git filter-branch --env-filter '
OLD_EMAIL="${GIT_AUTHOR_EMAIL}"
CORRECT_NAME="杨佳乐"
CORRECT_EMAIL="yjl516914@digital-engine.com"

if [ "$GIT_AUTHOR_EMAIL" != "$CORRECT_EMAIL" ]; then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags

if [ $? -eq 0 ]; then
    log_success "提交作者修复完成！"
    log_info "如果需要强制推送，请运行: git push --force-with-lease"
else
    log_error "修复失败"
    exit 1
fi
