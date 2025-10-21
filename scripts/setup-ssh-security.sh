#!/bin/bash
################################################################################
# SSH セキュリティ強化スクリプト
# - SSH公開鍵認証の設定
# - パスワード認証の無効化
# - SSHポート変更（オプション）
# - Fail2Banのインストール
#
# 使用方法:
#   chmod +x scripts/setup-ssh-security.sh
#   sudo scripts/setup-ssh-security.sh
################################################################################

set -e

# カラー設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# rootユーザーチェック
if [ "$EUID" -ne 0 ]; then 
    log_error "このスクリプトはroot権限で実行する必要があります"
    exit 1
fi

echo "=========================================="
echo "  SSH セキュリティ強化"
echo "=========================================="
echo ""

################################################################################
# ステップ1: ユーザーの選択
################################################################################

log_info "SSH公開鍵認証を設定するユーザーを選択してください"
echo ""

# ホームディレクトリを持つユーザーをリスト表示
USERS=($(awk -F: '$3 >= 1000 && $3 < 65534 {print $1}' /etc/passwd))

if [ ${#USERS[@]} -eq 0 ]; then
    log_error "ユーザーが見つかりません"
    exit 1
fi

echo "利用可能なユーザー:"
for i in "${!USERS[@]}"; do
    echo "  $((i+1)). ${USERS[$i]}"
done
echo ""

read -p "ユーザー番号を選択してください (1-${#USERS[@]}): " USER_INDEX

if [[ ! "$USER_INDEX" =~ ^[0-9]+$ ]] || [ "$USER_INDEX" -lt 1 ] || [ "$USER_INDEX" -gt ${#USERS[@]} ]; then
    log_error "無効な選択です"
    exit 1
fi

TARGET_USER="${USERS[$((USER_INDEX-1))]}"
USER_HOME=$(eval echo "~$TARGET_USER")

log_info "選択されたユーザー: ${TARGET_USER}"
log_info "ホームディレクトリ: ${USER_HOME}"

################################################################################
# ステップ2: SSH公開鍵の登録
################################################################################

echo ""
log_info "SSH公開鍵を登録します"
echo ""
log_warning "⚠️ 重要: ローカルPCで以下のコマンドを実行して公開鍵を確認してください:"
echo ""
echo "  Windows PowerShell:"
echo "    cat ~/.ssh/id_rsa.pub"
echo "    または"
echo "    cat ~/.ssh/id_ed25519.pub"
echo ""
echo "  鍵がない場合は生成してください:"
echo "    ssh-keygen -t ed25519 -C \"your-email@example.com\""
echo ""
echo "=========================================="
echo "公開鍵をペーストしてください（ssh-rsa または ssh-ed25519 で始まる）"
echo "入力後、Enterを2回押してください:"
echo "=========================================="

# 複数行入力を受け付ける
PUBLIC_KEY=""
while IFS= read -r line; do
    [ -z "$line" ] && break
    PUBLIC_KEY="${PUBLIC_KEY}${line}"
done

if [ -z "$PUBLIC_KEY" ]; then
    log_error "公開鍵が入力されませんでした"
    exit 1
fi

# 公開鍵の形式チェック
if [[ ! "$PUBLIC_KEY" =~ ^(ssh-rsa|ssh-ed25519|ecdsa-sha2-nistp256|ssh-dss)\ [A-Za-z0-9+/]+[=]{0,3} ]]; then
    log_error "無効な公開鍵の形式です"
    exit 1
fi

# .ssh ディレクトリの作成
log_info ".ssh ディレクトリを作成しています..."
sudo -u "$TARGET_USER" mkdir -p "${USER_HOME}/.ssh"
sudo -u "$TARGET_USER" chmod 700 "${USER_HOME}/.ssh"

# authorized_keys ファイルに公開鍵を追加
AUTHORIZED_KEYS="${USER_HOME}/.ssh/authorized_keys"
log_info "公開鍵を authorized_keys に追加しています..."

echo "$PUBLIC_KEY" | sudo -u "$TARGET_USER" tee -a "$AUTHORIZED_KEYS" > /dev/null
sudo -u "$TARGET_USER" chmod 600 "$AUTHORIZED_KEYS"

log_success "SSH公開鍵の登録完了"

################################################################################
# ステップ3: SSH設定のバックアップ
################################################################################

echo ""
log_info "SSH設定ファイルをバックアップしています..."

SSHD_CONFIG="/etc/ssh/sshd_config"
BACKUP_FILE="${SSHD_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

cp "$SSHD_CONFIG" "$BACKUP_FILE"
log_success "バックアップ完了: ${BACKUP_FILE}"

################################################################################
# ステップ4: SSH設定の変更
################################################################################

echo ""
log_info "SSH設定を変更します"
echo ""

# SSHポート変更の確認
read -p "SSHポートを変更しますか？ (デフォルト: 22) [y/N]: " CHANGE_PORT
SSH_PORT=22

if [[ "$CHANGE_PORT" =~ ^[Yy]$ ]]; then
    read -p "新しいSSHポート番号を入力してください (1024-65535): " SSH_PORT
    
    if [[ ! "$SSH_PORT" =~ ^[0-9]+$ ]] || [ "$SSH_PORT" -lt 1024 ] || [ "$SSH_PORT" -gt 65535 ]; then
        log_error "無効なポート番号です。デフォルトの22を使用します"
        SSH_PORT=22
    else
        log_warning "新しいSSHポート: ${SSH_PORT}"
        log_warning "ファイアウォール設定も変更します"
    fi
fi

# SSH設定の更新
log_info "sshd_config を更新しています..."

cat > /etc/ssh/sshd_config.d/99-custom-security.conf <<EOF
# Custom SSH Security Configuration
# Generated: $(date)

# SSH Port
Port ${SSH_PORT}

# 公開鍵認証を有効化
PubkeyAuthentication yes

# パスワード認証を無効化
PasswordAuthentication no

# チャレンジレスポンス認証を無効化
ChallengeResponseAuthentication no

# rootログインを無効化
PermitRootLogin no

# 空のパスワードを禁止
PermitEmptyPasswords no

# X11フォワーディングを無効化（不要な場合）
X11Forwarding no

# 最大認証試行回数
MaxAuthTries 3

# セッションのタイムアウト
ClientAliveInterval 300
ClientAliveCountMax 2

# 許可するユーザー（必要に応じて編集）
AllowUsers ${TARGET_USER}
EOF

log_success "SSH設定更新完了"

################################################################################
# ステップ5: ファイアウォール設定
################################################################################

echo ""
log_info "ファイアウォール設定を更新しています..."

# UFWのインストール確認
if ! command -v ufw &> /dev/null; then
    log_info "UFWをインストールしています..."
    apt install -y ufw
fi

# 新しいSSHポートを許可
if [ "$SSH_PORT" != "22" ]; then
    ufw allow "${SSH_PORT}/tcp" comment 'SSH Custom Port'
    ufw delete allow 22/tcp 2>/dev/null || true
else
    ufw allow ssh
fi

log_success "ファイアウォール設定完了"

################################################################################
# ステップ6: Fail2Banのインストール
################################################################################

echo ""
log_info "Fail2Banをインストールしています..."

if ! command -v fail2ban-client &> /dev/null; then
    apt install -y fail2ban
    
    # Fail2Ban設定
    cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ${SSH_PORT}
logpath = /var/log/auth.log
maxretry = 3
EOF
    
    systemctl enable fail2ban
    systemctl restart fail2ban
    
    log_success "Fail2Banインストール完了"
else
    log_info "Fail2Banは既にインストールされています"
    
    # ポート設定の更新
    sed -i "s/^port = .*/port = ${SSH_PORT}/" /etc/fail2ban/jail.local 2>/dev/null || true
    systemctl restart fail2ban
fi

################################################################################
# ステップ7: SSH設定のテストと再起動
################################################################################

echo ""
log_warning "=========================================="
log_warning "  ⚠️ 重要な警告"
log_warning "=========================================="
echo ""
log_warning "このままSSH設定を適用すると、パスワード認証が無効化されます"
log_warning "公開鍵でログインできることを確認してから、SSHを再起動してください"
echo ""
log_info "テスト手順:"
echo "  1. 現在のSSH接続はそのままにする"
echo "  2. 新しいターミナルを開く"
echo "  3. 以下のコマンドでSSH接続をテスト:"
echo ""
if [ "$SSH_PORT" != "22" ]; then
    echo "     ssh -p ${SSH_PORT} ${TARGET_USER}@$(hostname -I | awk '{print $1}')"
else
    echo "     ssh ${TARGET_USER}@$(hostname -I | awk '{print $1}')"
fi
echo ""
echo "  4. 接続できたら、このスクリプトに戻って続行する"
echo ""
read -p "テストが完了し、SSH設定を適用しますか？ [y/N]: " CONFIRM_APPLY

if [[ ! "$CONFIRM_APPLY" =~ ^[Yy]$ ]]; then
    log_warning "SSH設定の適用をキャンセルしました"
    log_info "設定を適用するには、以下のコマンドを実行してください:"
    echo "  sudo systemctl restart sshd"
    exit 0
fi

# SSH設定のテスト
log_info "SSH設定をテストしています..."
if sshd -t; then
    log_success "SSH設定は有効です"
else
    log_error "SSH設定にエラーがあります"
    log_info "バックアップから復元します: ${BACKUP_FILE}"
    cp "$BACKUP_FILE" "$SSHD_CONFIG"
    exit 1
fi

# SSHサービスの再起動
log_info "SSHサービスを再起動しています..."
systemctl restart sshd

log_success "SSHサービスの再起動完了"

################################################################################
# 完了メッセージ
################################################################################

echo ""
echo "=========================================="
echo "  ✅ SSH セキュリティ強化完了"
echo "=========================================="
echo ""
log_success "SSH公開鍵認証が有効化されました"
log_success "パスワード認証が無効化されました"
log_success "Fail2Banが有効化されました"
echo ""
echo "📊 設定情報:"
echo "  SSHポート: ${SSH_PORT}"
echo "  許可ユーザー: ${TARGET_USER}"
echo "  公開鍵認証: 有効"
echo "  パスワード認証: 無効"
echo "  Rootログイン: 無効"
echo ""
echo "🔐 接続方法:"
if [ "$SSH_PORT" != "22" ]; then
    echo "  ssh -p ${SSH_PORT} ${TARGET_USER}@$(hostname -I | awk '{print $1}')"
else
    echo "  ssh ${TARGET_USER}@$(hostname -I | awk '{print $1}')"
fi
echo ""
echo "⚠️  重要な注意事項:"
echo "  1. SSH秘密鍵を安全に保管してください"
echo "  2. バックアップファイル: ${BACKUP_FILE}"
echo "  3. Fail2Ban状態確認: sudo fail2ban-client status sshd"
echo "  4. SSH設定確認: sudo sshd -t"
echo ""
log_success "セキュリティ強化が完了しました！"
