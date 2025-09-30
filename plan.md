# 財務 AccountAnalysis 轉換工具 - 專案規劃

## 📋 專案概述

**專案名稱**: 財務 AccountAnalysis 轉換工具  
**技術棧**: React + Vite + Tailwind CSS + PapaParse + XLSX + Canvas Confetti  
**部署平台**: GitHub Pages  
**網站地址**: https://rubylee-lgtm.github.io/AccountAnalysis_trans/

## 🎯 功能需求

### 核心功能
1. **檔案上傳**: 支援 CSV 和 Excel (.xlsx) 檔案上傳
2. **欄位重新排序**: 根據預定義的欄位順序重新排列資料
3. **資料轉換**: 保留原始字串格式，避免自動轉換
4. **檔案下載**: 轉換完成後提供下載功能
5. **動畫效果**: 轉換完成後觸發彩帶動畫

### 預定義欄位順序
```
PARTY_NUMBER, PARTY_NAME, PERIOD_NAME, NATURAL_ACCOUNT_SEGMENT, 
NATURAL_ACCOUNT_DESC, GL_DATE, TRANSACTION_NUMBER, LINE_DESCRIPTION, 
ACCOUNTED_DR, ACCOUNTED_CR
```

## 🔧 技術實現

### 前端架構
- **React 18.2.0**: 主要UI框架
- **Vite 5.2.0**: 建置工具和開發伺服器
- **Tailwind CSS 3.4.4**: 樣式框架

### 核心依賴
- **PapaParse 5.4.1**: CSV檔案解析和生成
- **XLSX 0.18.5**: Excel檔案讀取
- **Canvas Confetti 1.6.0**: 彩帶動畫效果

### 檔案結構
```
AccountAnalysis/
├── src/
│   ├── App.jsx          # 主要應用程式組件
│   ├── main.jsx         # React入口點
│   └── index.css        # 全域樣式
├── index.html           # HTML模板
├── package.json         # 專案配置
├── vite.config.js       # Vite配置
├── tailwind.config.js   # Tailwind配置
└── postcss.config.js    # PostCSS配置
```

## 🎨 使用者介面

### 主要元件
1. **檔案選擇按鈕**: 支援拖拽和點擊上傳
2. **轉換按鈕**: 觸發資料轉換流程
3. **重新選擇檔案按鈕**: 清除當前選擇
4. **下載按鈕**: 轉換完成後顯示
5. **彩帶動畫**: 轉換成功後的視覺回饋

### 設計特色
- 響應式設計，支援各種螢幕尺寸
- 現代化UI，使用Tailwind CSS
- 直觀的操作流程
- 即時狀態回饋

## 🚀 部署配置

### GitHub Pages 部署
- **倉庫地址**: https://github.com/rubylee-lgtm/AccountAnalysis_trans.git
- **部署分支**: `gh-pages`
- **網站地址**: https://rubylee-lgtm.github.io/AccountAnalysis_trans/
- **建置配置**: Vite base path 設定為 `/AccountAnalysis_trans/`

### 部署流程
1. **建置專案**: `npm run build`
2. **創建gh-pages分支**: `git checkout --orphan gh-pages`
3. **複製建置檔案**: 將 `dist/` 內容複製到根目錄
4. **提交並推送**: 推送到 `gh-pages` 分支

### 部署命令
```bash
# 建置專案
npm run build

# 切換到gh-pages分支
git checkout --orphan gh-pages

# 複製建置檔案
cp -r dist/* .

# 提交並推送
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

## 🔍 問題解決記錄

### 1. 編碼問題
**問題**: CSV檔案上傳後出現亂碼  
**解決方案**: 
- 實現多編碼檢測機制 (UTF-8, Big5, GB2312, GBK, Latin1, Windows-1252)
- 添加BOM檢測 (UTF-8, UTF-16 LE)
- 清理Unicode替換字符和控制字符

### 2. Excel格式轉換問題
**問題**: Excel檔案中的日期和數字被自動轉換  
**解決方案**:
- 配置XLSX讀取選項: `cellDates: false`, `cellText: true`, `raw: true`
- 所有欄位強制轉換為字串: `String(value)`
- 手動生成CSV輸出，確保所有欄位用雙引號包圍

### 3. GitHub Pages空白頁面
**問題**: 部署後網站顯示空白  
**解決方案**:
- 在 `vite.config.js` 中設定正確的base path: `base: '/AccountAnalysis_trans/'`
- 重新建置並強制推送到gh-pages分支

### 4. 路徑配置問題
**問題**: 靜態資源路徑錯誤  
**解決方案**:
- 確保Vite配置中的base path與GitHub Pages子目錄匹配
- 使用 `--force` 參數覆蓋遠端分支

## 📊 效能優化

### 建置結果
- **HTML**: 0.49 kB (gzip: 0.35 kB)
- **CSS**: 8.93 kB (gzip: 2.50 kB)
- **JavaScript**: 503.66 kB (gzip: 170.30 kB)

### 優化措施
- 使用Vite進行快速建置
- Tailwind CSS的JIT編譯
- 生產環境的程式碼壓縮
- Gzip壓縮減少傳輸大小

## 🔮 未來擴展

### 功能增強
1. **批次處理**: 支援多檔案同時轉換
2. **預覽功能**: 轉換前預覽資料
3. **範本管理**: 自定義欄位順序
4. **歷史記錄**: 保存轉換歷史
5. **資料驗證**: 轉換前檢查資料完整性

### 技術改進
1. **PWA支援**: 離線使用功能
2. **國際化**: 多語言支援
3. **主題切換**: 深色/淺色模式
4. **效能監控**: 轉換時間統計

## 📝 開發日誌

### 版本 1.0.0 (2024-12-19)
- ✅ 基本檔案上傳功能
- ✅ CSV/Excel檔案支援
- ✅ 欄位重新排序
- ✅ 彩帶動畫效果
- ✅ GitHub Pages部署
- ✅ 響應式設計

### 部署記錄
- **初始部署**: 2024-12-19 成功推送到GitHub Pages
- **路徑修復**: 2024-12-19 修復base path配置問題
- **強制更新**: 2024-12-19 使用 `--force` 參數解決部署衝突

## 🛠️ 開發環境

### 本地開發
```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置生產版本
npm run build

# 預覽建置結果
npm run preview
```

### 環境要求
- Node.js 16.0+
- npm 7.0+
- 現代瀏覽器支援ES6+

## 📞 技術支援

### 常見問題
1. **檔案上傳失敗**: 檢查檔案格式是否為CSV或Excel
2. **轉換後亂碼**: 確認原始檔案編碼格式
3. **下載失敗**: 檢查瀏覽器是否阻擋下載
4. **動畫不顯示**: 確認Canvas Confetti套件正常載入

### 聯絡資訊
- **GitHub**: https://github.com/rubylee-lgtm/AccountAnalysis_trans
- **專案頁面**: https://rubylee-lgtm.github.io/AccountAnalysis_trans/

---

**最後更新**: 2024-12-19  
**版本**: 1.0.0  
**狀態**: 生產環境運行中 ✅
