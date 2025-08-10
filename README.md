# Bike Model Detection

バイクの車種を検出するWebアプリケーション

## 機能
- 画像アップロードによるバイク車種の自動検出
- OpenAI Vision APIを使用した高精度な車種識別
- リアルタイムでの検出結果表示
- 上位3つの予測結果と信頼度の表示

## 技術スタック
- **Backend**: FastAPI + Python + OpenAI Vision API
- **Frontend**: React + TypeScript + Tailwind CSS
- **AI**: OpenAI GPT-4 Vision API

## 前提条件
- **Windows**: Python 3.8以上、Node.js 16以上
- **Mac**: Python 3.8以上、Node.js 16以上
- **OpenAI API Key**: [OpenAI Platform](https://platform.openai.com/)でアカウント作成とAPIキー取得が必要

## セットアップ手順

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd bike-model-detection
```

### 2. バックエンドのセットアップ

#### Windows環境
```cmd
# Poetryのインストール（未インストールの場合）
curl -sSL https://install.python-poetry.org | python -

# バックエンドディレクトリに移動
cd backend

# 依存関係のインストール
poetry install

# 環境変数ファイルの作成
copy .env.example .env
```

#### Mac環境
```bash
# Poetryのインストール（未インストールの場合）
curl -sSL https://install.python-poetry.org | python3 -

# バックエンドディレクトリに移動
cd backend

# 依存関係のインストール
poetry install

# 環境変数ファイルの作成
cp .env.example .env
```

#### OpenAI APIキーの設定
`.env`ファイルを編集して、OpenAI APIキーを設定してください：

```env
# OpenAI API設定
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

**重要**: 
- APIキーは絶対に公開リポジトリにコミットしないでください
- `.env`ファイルは`.gitignore`に含まれています

### 3. フロントエンドのセットアップ

#### Windows環境
```cmd
# フロントエンドディレクトリに移動
cd ../frontend

# 依存関係のインストール
npm install

# または yarn を使用する場合
yarn install
```

#### Mac環境
```bash
# フロントエンドディレクトリに移動
cd ../frontend

# 依存関係のインストール
npm install

# または yarn を使用する場合
yarn install
```

### 4. アプリケーションの起動

#### バックエンドサーバーの起動

**Windows**:
```cmd
cd backend
poetry run fastapi dev app/main.py
```

**Mac**:
```bash
cd backend
poetry run fastapi dev app/main.py
```

バックエンドサーバーは `http://localhost:8000` で起動します。

#### フロントエンドサーバーの起動

新しいターミナル/コマンドプロンプトを開いて：

**Windows**:
```cmd
cd frontend
npm run dev
```

**Mac**:
```bash
cd frontend
npm run dev
```

フロントエンドサーバーは `http://localhost:5173` で起動します。

### 5. アプリケーションの使用方法

1. ブラウザで `http://localhost:5173` にアクセス
2. 「画像アップロード」セクションでバイクの画像を選択
3. 「車種を検出」ボタンをクリック
4. AI による車種検出結果を確認

## API エンドポイント

- `GET /`: API情報とエンドポイント一覧
- `GET /healthz`: ヘルスチェック
- `GET /models`: 利用可能なバイクモデル一覧
- `POST /detect`: 画像からバイク車種を検出

## 利用可能な車種

- Honda CBR600RR
- Yamaha YZF-R1
- Kawasaki Ninja ZX-10R
- Suzuki GSX-R1000
- Ducati Panigale V4
- BMW S1000RR
- Aprilia RSV4
- KTM RC 390
- Triumph Daytona 675
- MV Agusta F3

## トラブルシューティング

### OpenAI APIキーが設定されていない場合
APIキーが未設定の場合、システムは自動的にデモモード（ランダム予測）で動作します。実際のAI検出を使用するには、有効なOpenAI APIキーが必要です。

### ポートが使用中の場合
- バックエンド: `poetry run fastapi dev app/main.py --port 8001`
- フロントエンド: `npm run dev -- --port 5174`

### 依存関係のエラー
```bash
# バックエンド
cd backend
poetry install --no-cache

# フロントエンド
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## セキュリティ注意事項

- OpenAI APIキーは環境変数で管理し、ソースコードには含めない
- `.env`ファイルは絶対にGitにコミットしない
- 本番環境では適切なCORS設定を行う

## 開発者
- **実装**: Devin AI
- **要求者**: @Yusuke3974 (真保勇佑)
- **Devin セッション**: https://app.devin.ai/sessions/f516cdf646424eafb2678760b4fc9fe6
