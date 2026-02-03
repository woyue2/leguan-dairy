#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
cd "$SCRIPT_DIR"

LOG_FILE="部署记录.log"

# 远程服务器配置（请按需修改）
REMOTE_HOST="root@172.245.142.4"
REMOTE_DIR="/root/"
REMOTE_PORT=22
RESTART_NGINX="true"

# Docker 打包与上传配置（按需开启）
ENABLE_DOCKER_PACKAGE="true"
DOCKER_IMAGE_NAME="diary-app:latest"
DOCKER_TAR_FILE="diary-app.tar"
REMOTE_TAR_DIR="/root"

if [[ ! -f "$LOG_FILE" ]]; then
  echo "未找到日志文件: $LOG_FILE，请先创建或检查路径。"
  exit 1
fi

if [[ $# -gt 0 ]]; then
  COMMIT_MSG="$*"
else
  # 从部署记录中读取最后一行非空内容作为提交说明
  COMMIT_MSG="$(grep -v '^[[:space:]]*$' "$LOG_FILE" | tail -n 1 || true)"
  if [[ -z "${COMMIT_MSG// }" ]]; then
    echo "无法从 $LOG_FILE 中读取有效记录，请在执行时手动传入提交说明，例如："
    echo "  ./deploy.sh \"修复了 XXX 问题\""
    exit 1
  fi
fi

echo "使用提交说明: $COMMIT_MSG"

git add .

if git diff --cached --quiet; then
  echo "没有需要提交的变更，跳过提交步骤。"
else
  git commit -m "$COMMIT_MSG"
fi

git push

# 如需 Docker 打包 & 上传，则执行
if [[ "$ENABLE_DOCKER_PACKAGE" == "true" ]]; then
  echo "开始构建 Docker 镜像: $DOCKER_IMAGE_NAME ..."
  docker build -t "$DOCKER_IMAGE_NAME" .

  echo "导出镜像到本地文件: $DOCKER_TAR_FILE ..."
  docker save "$DOCKER_IMAGE_NAME" > "$DOCKER_TAR_FILE"

  if [[ -n "$REMOTE_HOST" && -n "$REMOTE_TAR_DIR" ]]; then
    echo "上传镜像文件到远程服务器: $REMOTE_HOST:$REMOTE_TAR_DIR/$DOCKER_TAR_FILE ..."
    scp "$DOCKER_TAR_FILE" "${REMOTE_HOST}:${REMOTE_TAR_DIR}/"
  else
    echo "未配置远程 tar 目录，跳过 scp 上传。"
  fi
fi

if [[ -n "$REMOTE_HOST" && -n "$REMOTE_DIR" ]]; then
  echo "开始远程部署到 $REMOTE_HOST:$REMOTE_DIR ..."
  SSH_CMD="cd '$REMOTE_DIR' && git pull"
  if [[ "$RESTART_NGINX" == "true" ]]; then
    SSH_CMD="$SSH_CMD && sudo systemctl restart nginx"
  fi
  ssh -p "$REMOTE_PORT" "$REMOTE_HOST" "$SSH_CMD"
  echo "远程部署完成。"
else
  echo "未配置远程服务器信息，仅完成 git push。"
fi
