#!/bin/bash

# 仓库清理脚本 - 用于减小git仓库大小
set -e

echo "🧹 开始清理仓库..."

# 清理构建产物
echo "📦 清理构建产物..."
rm -rf dist/ build/ .next/ coverage/ 2>/dev/null || true

# 清理Cypress测试产物
echo "🎬 清理Cypress测试产物..."
rm -rf cypress/videos/ cypress/screenshots/ 2>/dev/null || true

# 清理缓存
echo "🗑️  清理缓存..."
rm -rf node_modules/.cache/ .npm/ .yarn/cache/ 2>/dev/null || true

# 清理git历史中的大文件（谨慎使用）
echo "🔍 检查git历史中的大文件..."
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  awk '/^blob/ {print $3 " " $2}' | \
  sort -nr | \
  head -20

echo "✅ 清理完成！"
echo "💡 如果需要清理git历史中的大文件，请手动运行:"
echo "   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch <filename>' --prune-empty --tag-name-filter cat -- --all"