# SMART on FHIR 完整授權流程說明

## 📋 概述

SMART on FHIR 是基於 OAuth 2.0 和 OpenID Connect (OIDC) 的標準協議，用於安全地存取 FHIR 資源。本文件詳細說明前端 App 在瀏覽器中如何完成完整的授權流程。

## 🔐 完整流程步驟

### 步驟 1: 發起授權請求（Authorization Request）

前端 App 在瀏覽器中發起授權請求，導向 THAS 授權伺服器。

#### 請求參數

```
GET https://thas.mohw.gov.tw/provider-login?
  response_type=code
  &client_id=my-client-id
  &scope=launch/patient patient/*.read openid fhirUser
  &redirect_uri=https://hlai.tzuchi.com.tw/tzuchi-healthreport-demo/index.html
  &aud=https://thas.mohw.gov.tw/v/r4/sim/.../fhir
  &state=3TASYX8awVgh5S4u
  &code_challenge=HH03MxYuFx1XnsvG6CVzDGlGrC9lT2ii2ZRYibiYkLg
  &code_challenge_method=S256
  &login_type=provider
```

#### 參數說明

| 參數 | 說明 | 範例 |
|------|------|------|
| `response_type` | OAuth 2.0 回應類型，固定為 `code` | `code` |
| `client_id` | 應用程式在 THAS 註冊的唯一識別碼 | `my-client-id` |
| `scope` | 請求的權限範圍 | `launch/patient patient/*.read openid fhirUser` |
| `redirect_uri` | 授權完成後的回調網址 | `https://.../index.html` |
| `aud` | Audience，FHIR 伺服器的 ISS URL | `https://thas.mohw.gov.tw/v/r4/sim/.../fhir` |
| `state` | 隨機字串，用於防止 CSRF 攻擊 | `3TASYX8awVgh5S4u` |
| `code_challenge` | PKCE 的 code challenge（Base64 URL-safe SHA256） | `HH03MxYuFx1XnsvG6CVzDGlGrC9lT2ii2ZRYibiYkLg` |
| `code_challenge_method` | PKCE 的加密方法，固定為 `S256` | `S256` |
| `login_type` | 登入類型，`provider` 表示醫事人員登入 | `provider` |

#### 程式碼範例

```javascript
// 使用 fhirclient 庫自動處理授權請求
await FHIR.oauth2.authorize({
    iss: 'https://thas.mohw.gov.tw/v/r4/sim/.../fhir',
    clientId: 'my-client-id',
    scope: 'launch/patient patient/*.read openid fhirUser',
    redirectUri: 'https://hlai.tzuchi.com.tw/tzuchi-healthreport-demo/index.html'
});

// fhirclient 會自動：
// 1. 生成隨機的 state 參數
// 2. 生成 PKCE 的 code_verifier 和 code_challenge
// 3. 構建授權 URL 並導向授權伺服器
```

### 步驟 2: 使用者登入與同意（User Login & Consent）

使用者被導向 THAS 授權頁面，完成以下操作：

1. **Practitioner Login（醫事人員登入）**
   - 輸入 Practitioner 名稱
   - 輸入密碼（沙盒環境中任何密碼都可以）

2. **Select Patient（選擇病人）**
   - 從病人列表中選擇要存取的病人
   - 點擊病人名稱進行選擇

3. **Authorize App Launch（授權同意）**
   - 確認應用程式請求的權限範圍
   - 點擊 "Approve" 同意授權

### 步驟 3: 取得 Authorization Code

授權完成後，THAS 伺服器會將使用者導向 `redirect_uri`，並在 URL 中附加授權碼：

```
https://hlai.tzuchi.com.tw/tzuchi-healthreport-demo/index.html?
  code=abc123xyz...
  &state=3TASYX8awVgh5S4u
```

#### 參數說明

| 參數 | 說明 |
|------|------|
| `code` | 授權碼（Authorization Code），一次性使用，有效期通常很短（如 10 分鐘） |
| `state` | 與步驟 1 中發送的 state 相同，用於驗證請求的完整性 |

### 步驟 4: 使用 PKCE 交換 Access Token

前端 App 收到 authorization code 後，使用 PKCE（Proof Key for Code Exchange）機制交換 access token。

#### PKCE 流程

1. **Code Verifier（步驟 1 中已生成）**
   - 隨機生成的 43-128 字元的字串
   - 儲存在瀏覽器的 sessionStorage 中

2. **Code Challenge（步驟 1 中已生成）**
   - 對 code_verifier 進行 Base64 URL-safe SHA256 雜湊
   - 在授權請求中發送給伺服器

3. **Token 交換請求**

```http
POST https://thas.mohw.gov.tw/v/r4/sim/.../fhir/auth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=abc123xyz...
&redirect_uri=https://hlai.tzuchi.com.tw/tzuchi-healthreport-demo/index.html
&client_id=my-client-id
&code_verifier=原始生成的 code_verifier
```

#### 程式碼範例

```javascript
// fhirclient 會自動處理 token 交換
// 當頁面載入時，檢查 URL 參數中的 code
const client = await FHIR.oauth2.ready();

// fhirclient 內部會：
// 1. 從 URL 取得 code 和 state
// 2. 驗證 state 是否與發送時一致
// 3. 從 sessionStorage 取得 code_verifier
// 4. 發送 token 交換請求
// 5. 儲存 access token 和 refresh token
```

#### Token 回應

```json
{
  "access_token": "eyJhbGciOiJlUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "launch/patient patient/*.read openid fhirUser",
  "patient": "2000000000",
  "id_token": "eyJhbGciOiJlUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 步驟 5: 使用 Access Token 呼叫 FHIR API

取得 access token 後，在後續的 FHIR API 請求中使用 Bearer token 進行認證。

#### 請求範例

```http
GET https://thas.mohw.gov.tw/v/r4/sim/.../fhir/Practitioner?_count=10&_summary=true&_sort=given
Authorization: Bearer eyJhbGciOiJlUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

#### 程式碼範例

```javascript
// 使用 fhirclient 自動處理 token
const patient = await client.patient.read();
// fhirclient 會自動在請求中加入 Authorization header

// 或手動使用 token
const response = await fetch('https://thas.mohw.gov.tw/v/r4/sim/.../fhir/Patient/2000000000', {
    headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
    }
});
const patient = await response.json();
```

## 🔒 PKCE 安全機制

### 為什麼需要 PKCE？

PKCE（Proof Key for Code Exchange）是 OAuth 2.0 的安全擴展，特別適用於：

1. **公開客戶端（Public Client）**
   - 前端 App 無法安全地儲存 client_secret
   - 使用 PKCE 提供額外的安全層級

2. **防止授權碼攔截攻擊**
   - 即使攻擊者取得 authorization code，沒有 code_verifier 也無法交換 token

### PKCE 運作原理

```
1. 客戶端生成：
   code_verifier = 隨機字串（43-128 字元）
   code_challenge = Base64URL(SHA256(code_verifier))

2. 授權請求時發送：
   code_challenge + code_challenge_method=S256

3. Token 交換時發送：
   code_verifier（原始值）

4. 伺服器驗證：
   Base64URL(SHA256(code_verifier)) == code_challenge
```

## 📊 完整流程圖

```
┌─────────────┐
│ 前端 App    │
│ (瀏覽器)    │
└──────┬──────┘
       │
       │ 1. 發起授權請求
       │    (包含 code_challenge)
       ▼
┌─────────────────────┐
│ THAS 授權伺服器      │
│ /provider-login      │
└──────┬──────────────┘
       │
       │ 2. 導向登入頁面
       ▼
┌─────────────────────┐
│ 使用者操作           │
│ - 登入               │
│ - 選擇病人           │
│ - 同意授權           │
└──────┬──────────────┘
       │
       │ 3. 導向 redirect_uri
       │    (帶 code + state)
       ▼
┌─────────────┐
│ 前端 App    │
│ (index.html)│
└──────┬──────┘
       │
       │ 4. 使用 code_verifier
       │    交換 access token
       ▼
┌─────────────────────┐
│ THAS Token 端點      │
│ /auth/token          │
└──────┬──────────────┘
       │
       │ 5. 返回 access token
       ▼
┌─────────────┐
│ 前端 App    │
│ (儲存 token)│
└──────┬──────┘
       │
       │ 6. 使用 Bearer token
       │    呼叫 FHIR API
       ▼
┌─────────────────────┐
│ THAS FHIR 伺服器     │
│ /fhir/Patient/...    │
└─────────────────────┘
```

## 💻 實作範例

### 使用 fhirclient 庫（推薦）

```javascript
// launch.html - 發起授權
async function handleLaunch() {
    const client = await FHIR.oauth2.authorize({
        iss: 'https://thas.mohw.gov.tw/v/r4/sim/.../fhir',
        clientId: 'my-client-id',
        scope: 'launch/patient patient/*.read openid fhirUser',
        redirectUri: window.location.origin + '/index.html'
    });
    // 自動導向授權頁面
}

// index.html - 處理授權回調並使用 token
window.addEventListener('DOMContentLoaded', async () => {
    // 自動處理 code 交換 token
    const client = await FHIR.oauth2.ready();
    
    // 使用 token 呼叫 FHIR API
    const patient = await client.patient.read();
    console.log('病人資料:', patient);
});
```

### 手動實作（進階）

```javascript
// 步驟 1: 生成 PKCE 參數
function generatePKCE() {
    const codeVerifier = generateRandomString(128);
    const codeChallenge = base64URLEncode(sha256(codeVerifier));
    
    // 儲存 code_verifier 到 sessionStorage
    sessionStorage.setItem('code_verifier', codeVerifier);
    
    return { codeVerifier, codeChallenge };
}

// 步驟 2: 發起授權請求
function initiateAuth() {
    const { codeChallenge } = generatePKCE();
    const state = generateRandomString(16);
    sessionStorage.setItem('oauth_state', state);
    
    const authUrl = new URL('https://thas.mohw.gov.tw/provider-login');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', 'my-client-id');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    
    window.location.href = authUrl.toString();
}

// 步驟 3: 處理授權回調
async function handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    // 驗證 state
    if (state !== sessionStorage.getItem('oauth_state')) {
        throw new Error('State 驗證失敗');
    }
    
    // 步驟 4: 交換 token
    const codeVerifier = sessionStorage.getItem('code_verifier');
    const tokenResponse = await fetch('https://thas.mohw.gov.tw/v/r4/sim/.../fhir/auth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            client_id: 'my-client-id',
            code_verifier: codeVerifier
        })
    });
    
    const tokens = await tokenResponse.json();
    sessionStorage.setItem('access_token', tokens.access_token);
    
    // 步驟 5: 使用 token 呼叫 FHIR API
    const patientResponse = await fetch('https://thas.mohw.gov.tw/v/r4/sim/.../fhir/Patient/2000000000', {
        headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Accept': 'application/json'
        }
    });
    
    const patient = await patientResponse.json();
    return patient;
}
```

## 🔍 除錯技巧

### 檢查授權流程

1. **Network 標籤**
   - 查看 `/provider-login` 請求的參數
   - 確認 `code_challenge` 和 `state` 已正確發送

2. **檢查 Token 交換**
   - 查看 `/auth/token` 請求
   - 確認 `code_verifier` 已正確發送
   - 檢查回應中的 `access_token`

3. **檢查 FHIR API 請求**
   - 查看 FHIR API 請求的 Headers
   - 確認 `Authorization: Bearer ...` 已正確設定
   - 檢查回應狀態碼（200 表示成功）

### 常見問題

1. **"invalid_request" 錯誤**
   - 檢查 `redirect_uri` 是否與註冊時一致
   - 檢查 `client_id` 是否正確
   - 檢查參數格式是否正確

2. **"invalid_grant" 錯誤**
   - 檢查 `code_verifier` 是否正確
   - 檢查 authorization code 是否已過期
   - 確認 code 只使用一次

3. **"unauthorized_client" 錯誤**
   - 檢查 `client_id` 是否在 THAS 註冊
   - 檢查 `redirect_uri` 是否在允許列表中

## 📚 相關資源

- [OAuth 2.0 規範](https://oauth.net/2/)
- [PKCE 規範](https://oauth.net/2/pkce/)
- [SMART on FHIR 官方文件](http://docs.smarthealthit.org/)
- [FHIR 官方文件](https://www.hl7.org/fhir/)
