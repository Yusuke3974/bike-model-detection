import { useState, useRef } from 'react'
import { Upload, Camera, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Prediction {
  model: string
  confidence: number
}

interface DetectionResult {
  success: boolean
  filename: string
  predictions: Prediction[]
  top_prediction: Prediction
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResult(null)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(`${API_BASE_URL}/detect`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: DetectionResult = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            バイク車種検出システム
          </h1>
          <p className="text-lg text-gray-600">
            画像をアップロードしてバイクの車種を自動検出します
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* アップロード部分 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                画像アップロード
              </CardTitle>
              <CardDescription>
                バイクの画像を選択してください（JPG、PNG対応）
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {previewUrl ? (
                  <div className="space-y-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="text-gray-600">
                      クリックして画像を選択するか、ドラッグ＆ドロップしてください
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full"
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isLoading}
                  className="flex-1"
                >
                  {isLoading ? '検出中...' : '車種を検出'}
                </Button>
                <Button
                  onClick={resetForm}
                  variant="outline"
                  disabled={isLoading}
                >
                  リセット
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 結果表示部分 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                検出結果
              </CardTitle>
              <CardDescription>
                AIによる車種検出の結果を表示します
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">
                      最も可能性の高い車種
                    </h3>
                    <p className="text-lg font-bold text-green-900">
                      {result.top_prediction.model}
                    </p>
                    <p className="text-sm text-green-700">
                      信頼度: {(result.top_prediction.confidence * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">全ての予測結果</h3>
                    <div className="space-y-2">
                      {result.predictions.map((prediction, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="font-medium">{prediction.model}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${prediction.confidence * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-12">
                              {(prediction.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!result && !error && !isLoading && (
                <div className="text-center text-gray-500 py-8">
                  画像をアップロードして検出を開始してください
                </div>
              )}

              {isLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">AIが画像を解析中...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            このシステムはデモ用です。実際の検出精度は訓練データと使用するモデルによって異なります。
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
