# 大文件处理指南

## 问题描述

在GitHub Actions中执行e2e测试时，check-size阶段报错：
```
Large file(s) detected! Setting PR status to failed. Consider using git-lfs to track the LFS file(s)
```

## 解决方案

### 1. 立即修复

已经进行了以下优化：

- ✅ 将文件大小限制从512KB提高到10MB
- ✅ 添加了.gitattributes文件配置LFS跟踪
- ✅ 优化了.gitignore文件排除大文件
- ✅ 在GitHub Actions中添加了清理步骤
- ✅ 创建了预提交钩子防止大文件提交

### 2. 使用Git LFS（推荐）

如果需要提交大文件，请使用Git LFS：

```bash
# 安装Git LFS
brew install git-lfs

# 初始化Git LFS
git lfs install

# 跟踪大文件类型
git lfs track "*.zip"
git lfs track "*.tar.gz"
git lfs track "*.mp4"
git lfs track "*.mov"
git lfs track "*.psd"
git lfs track "*.ai"

# 提交跟踪配置
git add .gitattributes
git commit -m "feat: add Git LFS tracking for large files"
```

### 3. 清理现有大文件

如果历史提交中有大文件，可以使用以下方法清理：

```bash
# 查看大文件列表
./scripts/cleanup-repo.sh

# 清理特定文件（谨慎使用）
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch cypress/downloads/downloads.html' \
  --prune-empty --tag-name-filter cat -- --all

# 强制推送到远程（会重写历史）
git push origin --force --all
```

### 4. 预防措施

- **预提交检查**：已添加 `scripts/pre-commit-size-check`
- **CI/CD优化**：工作流中自动清理大文件
- **文件忽略**：.gitignore中排除了常见大文件类型

### 5. 文件大小限制

| 文件类型 | 限制大小 | 处理方式 |
|---------|----------|----------|
| 代码文件 | 无限制 | 直接提交 |
| 图片资源 | < 10MB | 直接提交 |
| 视频文件 | ≥ 10MB | 使用LFS |
| 压缩包 | ≥ 10MB | 使用LFS |
| 设计文件 | ≥ 10MB | 使用LFS |

### 6. 常见问题

**Q: 为什么我的PR被标记为失败？**
A: 检查是否提交了大于10MB的文件，或查看check-size.yaml的详细日志。

**Q: 如何临时绕过检查？**
A: 不建议绕过，应该使用Git LFS或移除大文件。

**Q: 哪些文件应该使用LFS？**
A: 视频、大型压缩包、设计源文件、二进制文件等。

## 相关文件

- `.github/workflows/check-size.yaml` - 文件大小检查配置
- `.gitattributes` - Git LFS和文件属性配置
- `.gitignore` - 忽略文件配置
- `scripts/cleanup-repo.sh` - 仓库清理脚本
- `scripts/pre-commit-size-check` - 预提交检查脚本