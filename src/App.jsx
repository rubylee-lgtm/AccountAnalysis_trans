import React, { useState, useRef } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import confetti from 'canvas-confetti'

// 定義需要的欄位順序
const REQUIRED_COLUMNS = [
  'PARTY_NUMBER',
  'PARTY_NAME', 
  'PERIOD_NAME',
  'NATURAL_ACCOUNT_SEGMENT',
  'NATURAL_ACCOUNT_DESC',
  'GL_DATE',
  'TRANSACTION_NUMBER',
  'LINE_DESCRIPTION',
  'ACCOUNTED_DR',
  'ACCOUNTED_CR'
]

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [convertedData, setConvertedData] = useState(null)
  const [isConverting, setIsConverting] = useState(false)
  const fileInputRef = useRef(null)

  // 觸發彩帶效果
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  // 處理檔案選擇
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      setConvertedData(null)
    }
  }

  // 重新選擇檔案
  const resetFile = () => {
    setSelectedFile(null)
    setConvertedData(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 處理檔案轉換
  const handleConvert = async () => {
    if (!selectedFile) return

    setIsConverting(true)
    
    try {
      let data = []
      
      if (selectedFile.name.endsWith('.csv')) {
        // 處理CSV檔案
        const arrayBuffer = await selectedFile.arrayBuffer()
        
        // 檢測BOM並選擇適當的編碼
        let text
        const uint8Array = new Uint8Array(arrayBuffer)
        
        // 檢查BOM標記
        if (uint8Array.length >= 3 && uint8Array[0] === 0xEF && uint8Array[1] === 0xBB && uint8Array[2] === 0xBF) {
          // UTF-8 BOM
          text = new TextDecoder('utf-8').decode(arrayBuffer.slice(3))
        } else if (uint8Array.length >= 2 && uint8Array[0] === 0xFF && uint8Array[1] === 0xFE) {
          // UTF-16 LE BOM
          text = new TextDecoder('utf-16le').decode(arrayBuffer.slice(2))
        } else {
          // 嘗試多種編碼方式，按優先順序
          const encodings = ['utf-8', 'big5', 'gb2312', 'gbk', 'latin1', 'windows-1252']
          let success = false
          
          for (const encoding of encodings) {
            try {
              text = new TextDecoder(encoding).decode(arrayBuffer)
              // 檢查是否包含亂碼字符
              if (!text.includes('') && !text.includes('')) {
                success = true
                break
              }
            } catch (error) {
              continue
            }
          }
          
          if (!success) {
            // 如果所有編碼都失敗，使用UTF-8並嘗試修復
            text = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer)
          }
        }
        
        // 清理可能的亂碼字符
        text = text.replace(/\uFFFD/g, '') // 移除Unicode替換字符
                  .replace(/\u0000/g, '') // 移除空字符
                  .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // 移除控制字符
        
        // 解析CSV
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          encoding: 'UTF-8'
        }, (results) => {
          data = results.data
        })
      } else if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        // 處理Excel檔案
        const arrayBuffer = await selectedFile.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { 
          cellDates: false,
          cellNF: false,
          cellText: true,
          raw: true,
          dateNF: false
        })
        
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        // 轉換為陣列格式
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, 
          defval: '', 
          blankrows: false,
          rawNumbers: false
        })
        
        if (jsonData.length > 0) {
          const headers = jsonData[0]
          data = jsonData.slice(1).map(row => {
            const obj = {}
            headers.forEach((header, index) => {
              if (header) {
                const value = row[index]
                if (value !== undefined && value !== null) {
                  let stringValue = String(value)
                  stringValue = stringValue.replace(/\uFFFD/g, '') // 移除Unicode替換字符
                                          .replace(/\u0000/g, '') // 移除空字符
                                          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // 移除控制字符
                  if (header === 'PERIOD_NAME' || header === 'GL_DATE') {
                    obj[header] = stringValue.trim()
                  } else if (header === 'ACCOUNTED_DR' || header === 'ACCOUNTED_CR') {
                    obj[header] = stringValue
                  } else {
                    obj[header] = stringValue
                  }
                } else {
                  obj[header] = ''
                }
              }
            })
            return obj
          })
        }
      }

      // 轉換資料格式
      const convertedData = data.map(row => {
        const newRow = {}
        REQUIRED_COLUMNS.forEach(column => {
          const value = row[column]
          if (value !== undefined && value !== null) {
            let stringValue = String(value)
            stringValue = stringValue.replace(/\uFFFD/g, '') // 移除Unicode替換字符
                                    .replace(/\u0000/g, '') // 移除空字符
                                    .replace(/[\x00-\x08\x0B\x0C\u000E-\u001F\x7F]/g, '') // 移除控制字符
                                    .replace(/\s+/g, ' ') // 標準化空白字符
                                    .trim() // 移除前後空白
            if (column === 'PERIOD_NAME' || column === 'GL_DATE') {
              newRow[column] = stringValue
            } else if (column === 'ACCOUNTED_DR' || column === 'ACCOUNTED_CR') {
              newRow[column] = stringValue
            } else {
              newRow[column] = stringValue
            }
          } else {
            newRow[column] = ''
          }
        })
        return newRow
      })

      setConvertedData(convertedData)
      triggerConfetti()
      
    } catch (error) {
      console.error('轉換失敗:', error)
      alert('檔案轉換失敗，請檢查檔案格式是否正確')
    } finally {
      setIsConverting(false)
    }
  }

  // 下載轉換後的檔案
  const handleDownload = () => {
    if (!convertedData) return

    // 手動生成CSV字串，確保所有欄位都被雙引號包圍
    let csv = ''
    const headers = REQUIRED_COLUMNS.map(col => `"${col}"`).join(',')
    csv += headers + '\n'
    
    convertedData.forEach(row => {
      const values = REQUIRED_COLUMNS.map(column => {
        const value = row[column] || ''
        let stringValue = String(value)
        if (column === 'PERIOD_NAME' || column === 'GL_DATE') {
          stringValue = stringValue.trim()
        }
        const escapedValue = stringValue
          .replace(/"/g, '""')  // 轉義雙引號
          .replace(/\n/g, ' ')  // 替換換行符
          .replace(/\r/g, ' ')  // 替換回車符
          .replace(/\t/g, ' ')  // 替換製表符
        return `"${escapedValue}"`
      })
      csv += values.join(',') + '\n'
    })

    // 添加BOM以確保Excel正確識別UTF-8編碼
    const BOM = '\uFEFF'
    const csvWithBOM = BOM + csv
    
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const filename = `converted_${year}${month}${day}.csv`
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.setAttribute('data-format', 'csv')
    link.setAttribute('data-encoding', 'utf-8')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">財務 AccountAnalysis 轉換工具</h1>
          <p className="text-gray-600 mb-8">上傳CSV或Excel檔案，系統將自動轉換為標準格式</p>
          
          <div className="space-y-6">
            {/* 檔案選擇區域 */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="cursor-pointer inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                選擇檔案
              </label>
              {selectedFile && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">已選擇: {selectedFile.name}</p>
                  <button
                    onClick={resetFile}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    重新選擇檔案
                  </button>
                </div>
              )}
            </div>

            {/* 操作按鈕 */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleConvert}
                disabled={!selectedFile || isConverting}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isConverting ? '轉換中...' : '轉換'}
              </button>
              
              {selectedFile && (
                <button
                  onClick={resetFile}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  清除
                </button>
              )}
            </div>

            {/* 下載按鈕 */}
            {convertedData && (
              <div className="text-center">
                <button
                  onClick={handleDownload}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  下載檔案
                </button>
                <p className="mt-2 text-sm text-gray-600">
                  轉換完成！共 {convertedData.length} 筆資料
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
