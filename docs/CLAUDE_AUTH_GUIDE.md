# Claude 인증 가이드

OpenCode에서 Claude를 사용하는 여러 인증 방법을 안내합니다.

## 인증 방법 비교

| 방법 | 장점 | 단점 | 권장도 |
|------|------|------|--------|
| API 키 | 공식 지원, 안정적 | 유료 (일부 무료 티어) | ⭐⭐⭐⭐⭐ |
| Claude Pro/Max 세션 | Pro/Max 구독 혜택 활용 | 구독 필요, 토큰 만료 가능 | ⭐⭐⭐⭐ |
| 쿠키 | 무료 사용 가능 | 비공식, 복잡함 | ⭐⭐ |
| OAuth | 보안성 높음 | 현재 미지원 | ❌ |

## 방법 1: API 키 방식 (권장)

### 설정 방법

1. **Anthropic Console 접속**
   - https://console.anthropic.com 접속
   - 계정 생성 또는 로그인

2. **API 키 발급**
   - Settings > API Keys 메뉴로 이동
   - "Create Key" 클릭
   - 키 이름 입력 후 생성
   - 생성된 키를 복사 (한 번만 표시됨)

3. **환경 변수 설정**
   ```bash
   # .env 파일 생성
   OPENCODE_AUTH_TYPE=apiKey
   ANTHROPIC_API_KEY=sk-ant-xxxxx...
   OPENCODE_AI_PROVIDER=anthropic
   OPENCODE_AI_MODEL=claude-3-sonnet
   ```

### 장점
- ✅ 공식 지원 방식
- ✅ 안정적이고 신뢰할 수 있음
- ✅ 무료 티어 제공 (월 $5 크레딧)
- ✅ 사용량 추적 가능

## 방법 2: Claude Pro/Max 세션 토큰 방식

OpenCode에서 Anthropic을 선택하고 "Claude Pro/Max" 로그인 방법을 선택했을 때 사용하는 방법입니다.

### 설정 방법

1. **Claude 웹 인터페이스 로그인**
   - https://claude.ai 접속
   - Claude Pro 또는 Max 구독 계정으로 로그인

2. **세션 토큰 추출**
   - 브라우저 개발자 도구 열기 (F12)
   - Application 탭 클릭
   - 왼쪽 메뉴에서 Cookies > https://claude.ai 선택
   - `sessionKey` 쿠키 찾기
   - Value 값을 복사 (예: `sk-ant-api03-xxxxx...`)

3. **OpenCode에서 입력**
   - OpenCode 실행: `opencode`
   - Anthropic 선택
   - Login method에서 "Claude Pro/Max" 선택
   - 세션 토큰 값 입력 (복사한 `sessionKey` 값)

4. **환경 변수로 설정 (선택사항)**
   ```bash
   # .env 파일 생성
   OPENCODE_AUTH_TYPE=session
   CLAUDE_SESSION_TOKEN=sk-ant-api03-xxxxx...
   OPENCODE_AI_PROVIDER=anthropic
   OPENCODE_AI_MODEL=claude-3-opus  # 또는 claude-3-5-sonnet
   ```

### 세션 토큰 찾는 방법 (상세)

1. **Chrome/Edge 브라우저:**
   - F12 키 누르기
   - Application 탭 클릭
   - 왼쪽에서 Storage > Cookies > `https://claude.ai` 클릭
   - `sessionKey` 행의 Value 열에서 값 복사

2. **Firefox 브라우저:**
   - F12 키 누르기
   - Storage 탭 클릭
   - 왼쪽에서 Cookies > `https://claude.ai` 클릭
   - `sessionKey` 행의 Value 열에서 값 복사

### 주의사항
- ⚠️ Claude Pro/Max 구독이 필요합니다
- ⚠️ 세션 토큰은 만료될 수 있으므로 주기적으로 갱신 필요
- ⚠️ 세션 토큰은 보안상 민감한 정보이므로 공유하지 마세요
- ⚠️ 토큰이 만료되면 claude.ai에 다시 로그인하여 새 토큰을 추출해야 합니다

## 방법 3: 쿠키 방식

### 설정 방법

1. **Claude 웹 인터페이스 로그인**
   - https://claude.ai 접속
   - 계정으로 로그인

2. **쿠키 추출**
   - 브라우저 개발자 도구 열기 (F12)
   - Network 탭 열기
   - 페이지 새로고침 (F5)
   - 아무 요청 선택
   - Headers 탭에서 Request Headers의 Cookie 값 복사

3. **환경 변수 설정**
   ```bash
   # .env 파일 생성
   OPENCODE_AUTH_TYPE=cookie
   CLAUDE_COOKIE="sessionKey=xxx; __cf_bm=xxx; ..."
   OPENCODE_AI_PROVIDER=anthropic
   OPENCODE_AI_MODEL=claude-3-sonnet
   ```

### 주의사항
- ⚠️ 비공식 방식
- ⚠️ 쿠키는 자주 변경될 수 있음
- ⚠️ 보안상 민감한 정보 포함

## 방법 4: OAuth (현재 미지원)

Claude는 현재 공식적으로 OAuth를 지원하지 않습니다. 
만약 OAuth 방식이 필요하다면:
- Anthropic의 공식 발표를 기다리거나
- API 키 방식을 사용하는 것을 권장합니다

## OpenCode 설정 확인

`.opencode.config.js` 파일에서 인증 방식을 확인할 수 있습니다:

```javascript
ai: {
  authType: process.env.OPENCODE_AUTH_TYPE || 'apiKey',
  // ...
}
```

## 문제 해결

### "invalid x-api-key" 에러 해결

이 에러는 OpenCode가 API 키를 찾지 못하거나 유효하지 않은 키를 사용할 때 발생합니다.

#### 원인 1: API 키가 설정되지 않음

**해결 방법:**
1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. `.env` 파일에 올바른 환경 변수 설정:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-xxxxx...
   OPENCODE_AI_PROVIDER=anthropic
   ```
3. 환경 변수 확인 (Windows PowerShell):
   ```powershell
   $env:ANTHROPIC_API_KEY
   ```

#### 원인 2: API 키 형식이 잘못됨

**해결 방법:**
1. API 키 형식 확인:
   - Anthropic API 키는 `sk-ant-` 로 시작해야 합니다
   - 예: `sk-ant-api03-xxxxx...`
2. API 키에 공백이나 따옴표가 포함되지 않았는지 확인
3. Anthropic Console에서 새 API 키 발급:
   - https://console.anthropic.com 접속
   - Settings > API Keys > Create Key

#### 원인 3: 환경 변수가 로드되지 않음

**해결 방법:**
1. OpenCode 재시작:
   ```bash
   # OpenCode 종료 후 재실행
   opencode
   ```
2. 터미널 재시작 후 환경 변수 다시 설정
3. `.env` 파일이 `.gitignore`에 포함되어 있는지 확인 (보안)

#### 원인 4: API 키가 만료되었거나 비활성화됨

**해결 방법:**
1. Anthropic Console에서 API 키 상태 확인:
   - https://console.anthropic.com 접속
   - Settings > API Keys에서 키 상태 확인
2. 필요시 새 API 키 생성 및 교체

#### 원인 5: 잘못된 인증 방식 선택

**해결 방법:**
1. `.opencode.config.js` 파일 확인:
   ```javascript
   ai: {
     authType: process.env.OPENCODE_AUTH_TYPE || 'apiKey',
     apiKey: process.env.ANTHROPIC_API_KEY
   }
   ```
2. `OPENCODE_AUTH_TYPE` 환경 변수 확인:
   - API 키 사용 시: `OPENCODE_AUTH_TYPE=apiKey`
   - 세션 토큰 사용 시: `OPENCODE_AUTH_TYPE=session`

#### 원인 6: OpenCode 설정 파일 문제

**해결 방법:**
1. `.opencode.config.js` 파일에 `ai` 설정이 있는지 확인
2. 설정 파일이 올바른 형식인지 확인
3. 프로젝트 루트 디렉토리에서 OpenCode 실행

### 인증 실패 시 체크리스트

- [ ] `.env` 파일이 프로젝트 루트에 존재하는가?
- [ ] `ANTHROPIC_API_KEY` 환경 변수가 올바르게 설정되었는가?
- [ ] API 키 형식이 올바른가? (`sk-ant-`로 시작)
- [ ] API 키에 공백이나 특수문자가 포함되지 않았는가?
- [ ] `.opencode.config.js`에 `ai` 설정이 있는가?
- [ ] OpenCode를 재시작했는가?
- [ ] Anthropic Console에서 API 키가 활성화되어 있는가?
- [ ] API 키 사용량 한도에 도달하지 않았는가?

### 세션 토큰 만료 시

세션 토큰이 만료되면:
1. claude.ai에 다시 로그인
2. 새로운 세션 토큰 추출
3. `.env` 파일 업데이트

## 권장 사항

개발 환경에서는 **API 키 방식**을 강력히 권장합니다:
- 안정적이고 예측 가능한 동작
- 공식 지원으로 장기적 호환성 보장
- 무료 티어로 시작 가능
- 사용량 모니터링 가능

세션 토큰이나 쿠키 방식은:
- 테스트 목적으로만 사용
- 프로덕션 환경에서는 사용하지 않음
- 정기적으로 갱신 필요

