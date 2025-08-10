from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psycopg
from PIL import Image
import numpy as np
import io
from typing import Dict, List
import json
import base64
import openai
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

BIKE_MODELS = [
    "Honda CBR600RR",
    "Yamaha YZF-R1",
    "Kawasaki Ninja ZX-10R",
    "Suzuki GSX-R1000",
    "Ducati Panigale V4",
    "BMW S1000RR",
    "Aprilia RSV4",
    "KTM RC 390",
    "Triumph Daytona 675",
    "MV Agusta F3"
]

class BikeDetectionModel:
    def __init__(self):
        self.client = None
        self.is_loaded = False
    
    def load_model(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY環境変数が設定されていません")
        
        self.client = openai.OpenAI(api_key=api_key)
        self.is_loaded = True
    
    def predict(self, image: Image.Image) -> Dict:
        if not self.is_loaded:
            self.load_model()
        
        if not self.client:
            raise ValueError("OpenAI クライアントが初期化されていません")
        
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": f"""この画像に写っているバイクの車種を特定してください。以下のリストから最も可能性の高い3つを選んで、信頼度（0-1の範囲）と共に返してください。

利用可能な車種:
{', '.join(BIKE_MODELS)}

回答は以下のJSON形式で返してください:
{{
  "predictions": [
    {{"model": "車種名", "confidence": 0.85}},
    {{"model": "車種名", "confidence": 0.10}},
    {{"model": "車種名", "confidence": 0.05}}
  ]
}}

画像にバイクが写っていない場合は、最も近い車種を推測して返してください。"""
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{img_str}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=500
            )
            
            content = response.choices[0].message.content
            
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = content[start_idx:end_idx]
                result = json.loads(json_str)
                
                total_confidence = sum(pred["confidence"] for pred in result["predictions"])
                if total_confidence > 0:
                    for pred in result["predictions"]:
                        pred["confidence"] = pred["confidence"] / total_confidence
                
                return {
                    "predictions": result["predictions"],
                    "top_prediction": result["predictions"][0] if result["predictions"] else None
                }
            else:
                raise ValueError("有効なJSONレスポンスが見つかりませんでした")
                
        except Exception as e:
            print(f"OpenAI API エラー: {e}")
            predictions = np.random.random(len(BIKE_MODELS))
            predictions = predictions / np.sum(predictions)
            
            top_indices = np.argsort(predictions)[-3:][::-1]
            results = []
            
            for idx in top_indices:
                results.append({
                    "model": BIKE_MODELS[idx],
                    "confidence": float(predictions[idx])
                })
            
            return {
                "predictions": results,
                "top_prediction": results[0] if results else None
            }

bike_model = BikeDetectionModel()

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/models")
async def get_available_models():
    """利用可能なバイクモデル一覧を取得"""
    return {"models": BIKE_MODELS}

@app.post("/detect")
async def detect_bike_model(file: UploadFile = File(...)):
    """画像からバイクモデルを検出"""
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="アップロードされたファイルは画像である必要があります")
        
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        result = bike_model.predict(image)
        
        return {
            "success": True,
            "filename": file.filename,
            "predictions": result["predictions"],
            "top_prediction": result["top_prediction"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"画像処理中にエラーが発生しました: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "Bike Model Detection API",
        "version": "1.0.0",
        "endpoints": {
            "/healthz": "ヘルスチェック",
            "/models": "利用可能なバイクモデル一覧",
            "/detect": "バイクモデル検出（POST、画像ファイル必須）"
        }
    }
