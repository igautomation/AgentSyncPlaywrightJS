# TestRail Authentication Guide

## 🔐 Authentication Options

TestRail integration supports **two authentication methods**:

### **Option 1: API Key Authentication (Recommended)**
```bash
# .env.unified
TESTRAIL_URL=https://your-instance.testrail.io
TESTRAIL_USERNAME=your.email@company.com
TESTRAIL_API_KEY=your_api_key_here
TESTRAIL_PROJECT_ID=18
TESTRAIL_SUITE_ID=412
```

### **Option 2: Username/Password Authentication**
```bash
# .env.unified
TESTRAIL_URL=https://your-instance.testrail.io
TESTRAIL_USERNAME=your.email@company.com
TESTRAIL_PASSWORD=your_password_here
TESTRAIL_PROJECT_ID=18
TESTRAIL_SUITE_ID=412
```

## 🎯 How It Works

The framework automatically detects which authentication method to use:

1. **API Key Priority**: If `TESTRAIL_API_KEY` is provided, it will be used
2. **Password Fallback**: If no API key, falls back to `TESTRAIL_PASSWORD`
3. **Error Handling**: If neither is provided, shows clear error message

## 🔧 Getting Your API Key

1. Log into TestRail
2. Go to **My Settings** (top right corner)
3. Click **API Keys** tab
4. Click **Generate API Key**
5. Copy the generated key

## ✅ Verification

When tests run, you'll see:
```
🔐 TestRail auth: API Key
```
or
```
🔐 TestRail auth: Username/Password
```

## 🚀 Benefits

- **API Key**: More secure, no password exposure
- **Username/Password**: Simple setup for quick testing
- **Flexible**: Choose what works best for your environment
- **Automatic**: Framework handles the selection logic