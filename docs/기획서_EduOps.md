# EduOps - 종합학원 ERP 상세 기획서

> 작성일: 2026-02-18
> 버전: v1.0
> 상태: 기획 단계

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [사용자 정의](#2-사용자-정의)
3. [기능 명세](#3-기능-명세-feature-spec)
4. [데이터베이스 설계](#4-데이터베이스-설계)
5. [화면 설계](#5-화면-설계-wireframe-명세)
6. [기술 아키텍처](#6-기술-아키텍처)
7. [VocaBox 연동 설계](#7-vocabox-연동-설계)
8. [비즈니스 모델](#8-비즈니스-모델)
9. [개발 로드맵](#9-개발-로드맵)
10. [향후 확장 계획](#10-향후-확장-계획)

---

## 1. 프로젝트 개요

### 1.1 배경 및 문제 정의

현재 다과목을 운영하는 종합학원 / 입시학원에서는 학생 성적·출결·과제 관리를 **엑셀, 종이 대장, 또는 분산된 도구들**로 운영하고 있다.

**현재 운영 방식 (AS-IS):**

- 과목별로 별도의 성적 기록 시트(엑셀/구글시트)를 관리
- 시험 결과를 수기로 기록하거나 과목별 담당 강사가 개별 관리
- 출결 관리는 수기 출석부 또는 종이 명부 사용
- 학부모 상담 시 여러 과목의 성적을 수작업으로 취합
- 학생의 취약 영역 파악은 강사의 주관적 판단에 의존

**이 방식의 한계:**

| 문제 | 상세 설명 |
|------|-----------|
| 데이터 파편화 | 과목별, 강사별로 데이터가 분산되어 통합 분석 불가 |
| 성적 추적 불가 | 시간에 따른 학생 성장 추이를 체계적으로 파악하기 어려움 |
| 취약 영역 미탐지 | 특정 단원의 반복 실패를 시스템적으로 감지할 수 없음 |
| 출결 관리 비효율 | 종이 출석부 → 지각/결석 통계를 내기 어려움 |
| 학부모 소통 한계 | 통합 성적 리포트 생성에 과도한 시간 소요 |
| 알림 수동 처리 | 과제 미제출, 시험 리마인드 등을 모두 수작업으로 발송 |

### 1.2 프로젝트 목표

**TO-BE: EduOps 웹 서비스**

1. 다과목 학원의 **학습 단위(과목-교재-단원)**를 체계적으로 관리하는 시스템 구축
2. 다양한 평가 유형을 지원하고 **성적을 자동 분석**하여 인사이트 제공
3. **출결·과제·알림을 자동화**하여 운영 효율 극대화
4. 처음부터 **멀티테넌트(SaaS) 구조**로 설계하여 여러 학원에 서비스 제공 가능

### 1.3 핵심 가치 비교

| 항목 | 기존 (엑셀/수기) | EduOps |
|------|------------------|--------|
| 과목 관리 | 과목별 별도 시트 | 통합 과목-교재-단원 계층 관리 |
| 성적 기록 | 수기 기록 / 별도 엑셀 | 다양한 평가 유형 지원, 자동 집계 |
| 성적 분석 | 직접 계산 | 자동 그래프, 취약 영역 감지, 성장 추이 |
| 출결 관리 | 종이 출석부 | QR/PIN/수동 + 자동 분류 |
| 과제 관리 | 구두 전달 | 등록-알림-제출-피드백 전 과정 관리 |
| 학부모 소통 | 전화/수기 리포트 | 자동 알림 + 월간 리포트 발송 |
| 위험 감지 | 강사 주관 판단 | 조건 기반 자동 위험 신호 알림 |
| 확장성 | 학원마다 재구축 | 가입만 하면 바로 사용 (SaaS) |

### 1.4 서비스명

- **EduOps** (Education + Operations)
- 학원 교육 운영의 모든 것을 하나의 플랫폼에서 종합적으로 관리한다는 의미

### 1.5 VocaBox와의 관계

| 항목 | VocaBox (AiVoca) | EduOps |
|------|-------------------|--------|
| 대상 | 영어학원 (단어 시험 특화) | 종합학원 / 입시학원 (다과목) |
| 핵심 기능 | 단어장 관리, 시험지 출력, 점수 관리 | 학습 단위 관리, 평가 시스템, 분석, 운영 자동화 |
| 관계 | 독립 서비스 | 독립 서비스 (VocaBox 연동 가능) |

- EduOps는 **별도 서비스**로 운영하며, VocaBox의 단어 시험 데이터를 EduOps로 가져올 수 있는 연동 기능 제공
- 동일한 학원이 두 서비스를 모두 사용할 경우, VocaBox의 영어 단어 시험 점수가 EduOps의 영어 과목 성적에 자동 반영

---

## 2. 사용자 정의

### 2.1 사용자 유형 (MVP)

| 역할 | 설명 | 주요 권한 |
|------|------|-----------|
| **학원 관리자 (원장)** | 학원을 등록하고 전체 관리 권한 보유 | 학원 설정, 강사 계정 초대/관리, 전체 데이터 접근, 삭제 권한, 위험 신호 설정 |
| **강사** | 관리자가 초대한 교사 계정 | 담당 과목/학생 관리, 평가 생성/채점, 출결 체크, 과제 배정, 분석 리포트 조회 |
| **학생** | 학원에 등록된 학생 (MVP에서는 로그인 없음) | 향후 확장: 과제 제출, 성적 확인 |
| **학부모** | 학생의 보호자 (MVP에서는 로그인 없음) | 향후 확장: 알림 수신, 성적 리포트 열람 |

> **참고:** 학생/학부모 로그인은 MVP에서 제외. 관리자/강사가 대신 관리하며, 향후 확장에서 학생/학부모 포털 추가.

### 2.2 사용자 스토리 (User Stories)

#### 관리자(원장) 스토리

| ID | 스토리 | 우선순위 |
|----|--------|----------|
| A-01 | 원장은 이메일/비밀번호로 회원가입하고 학원을 등록할 수 있다 | 필수 |
| A-02 | 원장은 학원 기본 정보(학원명, 연락처, 로고)를 설정/수정할 수 있다 | 필수 |
| A-03 | 원장은 강사 이메일로 초대 링크를 보내서 교사 계정을 추가할 수 있다 | 필수 |
| A-04 | 원장은 과목을 생성하고 유형(정규/특강/캠프 등)을 설정할 수 있다 | 필수 |
| A-05 | 원장은 위험 신호 기준(점수, 결석률, 미제출 횟수)을 설정할 수 있다 | 필수 |
| A-06 | 원장은 대시보드에서 전체 학원 현황(위험 학생, 출결 통계 등)을 확인할 수 있다 | 필수 |
| A-07 | 원장은 학부모 알림 유형(출결/성적/과제)을 선택적으로 활성화할 수 있다 | 핵심 |

#### 강사 스토리

| ID | 스토리 | 우선순위 |
|----|--------|----------|
| T-01 | 강사는 새 학생을 등록하고 과목을 연결할 수 있다 | 필수 |
| T-02 | 강사는 교재를 등록하고 대단원/중단원/소단원 계층구조를 관리할 수 있다 | 필수 |
| T-03 | 강사는 다양한 유형(시험/과제/수행평가/퀴즈)의 평가를 생성할 수 있다 | 필수 |
| T-04 | 강사는 평가 방식(점수형/등급형/체크형)을 선택할 수 있다 | 필수 |
| T-05 | 강사는 매주 반복되는 시험 템플릿을 설정해 자동 생성할 수 있다 | 핵심 |
| T-06 | 강사는 학생별 또는 반 단위로 성적을 입력할 수 있다 | 필수 |
| T-07 | 강사는 결시/미제출 상태를 기록하고 보강 일정을 연결할 수 있다 | 필수 |
| T-08 | 강사는 학생별 성취도 그래프(막대/레이더/히트맵)를 확인할 수 있다 | 필수 |
| T-09 | 강사는 취약 영역이 자동 태깅된 학생을 대시보드에서 확인할 수 있다 | 핵심 |
| T-10 | 강사는 QR/PIN/수동 방식으로 출결을 관리할 수 있다 | 필수 |
| T-11 | 강사는 과제를 등록하고 마감 전/후 자동 알림을 설정할 수 있다 | 핵심 |
| T-12 | 강사는 학생의 성장 추이 그래프와 이동 평균을 확인할 수 있다 | 필수 |
| T-13 | 강사는 위험 신호가 발생한 학생 목록과 원인을 확인할 수 있다 | 핵심 |

---

## 3. 기능 명세 (Feature Spec)

### 3.1 인증 및 학원 등록

#### 3.1.1 학원 가입 플로우

```
[랜딩 페이지 방문]
    ↓
[회원가입 클릭]
    ↓
[Step 1: 계정 정보 입력]
  - 이메일 (필수)
  - 비밀번호 (필수, 8자 이상)
  - 비밀번호 확인
    ↓
[Step 2: 학원 정보 입력]
  - 학원명 (필수)
  - 학원 유형 (종합학원/입시학원/단과학원)
  - 학원 연락처 (선택)
  - 관리자 이름 (필수)
    ↓
[이메일 인증 (선택사항, 추후 도입 가능)]
    ↓
[학원 생성 + 관리자 계정 연결]
    ↓
[대시보드로 자동 이동]
```

**세부 사항:**
- Supabase Auth 기반 이메일/비밀번호 인증
- 가입 시 `academies` 테이블에 학원 레코드 생성
- 학원 slug 자동 생성 (학원명 기반, 예: `넥스트아카데미` → `next-academy-1234`)
- 가입 완료 후 대시보드로 자동 리다이렉트
- 로그인 시 소속 학원(academy_id) 자동 인식

#### 3.1.2 로그인

- 이메일 + 비밀번호 입력
- 비밀번호 찾기 (이메일로 재설정 링크 발송)
- 로그인 유지 (Supabase 세션 기반)

#### 3.1.3 강사 초대

```
[관리자: 설정 > 강사 관리]
    ↓
[초대하기 버튼 클릭]
    ↓
[강사 이메일 입력 + 담당 과목 선택]
    ↓
[초대 이메일 발송 (초대 링크 포함)]
    ↓
[강사: 초대 링크 클릭]
    ↓
[비밀번호 설정 + 이름 입력]
    ↓
[해당 학원에 자동 배정 + 담당 과목 연결]
    ↓
[대시보드로 이동]
```

---

### 3.2 학습 단위 관리

> **과목 → 교재 → 단원(대/중/소)** 3단계 계층구조로 학습 콘텐츠를 체계적으로 관리한다.

#### 3.2.1 과목 생성

**과목 등록 항목:**

| 필드 | 데이터 타입 | 필수 여부 | 설명 |
|------|------------|-----------|------|
| 과목명 | text | **필수** | 예: 영어, 수학, 과학 |
| 과목 색상 | text | **필수** | 대시보드 구분용 (HEX 코드) |
| 과목 아이콘 | text | 선택 | 아이콘 식별자 |
| 담당 강사 | uuid[] | 선택 | 복수 강사 지정 가능 |
| 연결 학생 | uuid[] | 선택 | 해당 과목 수강 학생 |
| 성적 반영 비율 | jsonb | 선택 | 평가 유형별 가중치 |

**과목 유형 선택:**

| 유형 | 설명 | 특징 |
|------|------|------|
| 정규 과목 | 주기적으로 진행되는 정규 수업 | 기본 유형 |
| 특강 | 일정 기간 집중 수업 | 시작일/종료일 설정 |
| 단기 캠프 | 방학 등 단기 프로그램 | 시작일/종료일 설정 |
| 수행평가형 | 수행평가 대비 과목 | 체크형 평가 위주 |
| 프로젝트형 | 모의고사 대비 등 프로젝트 단위 | 복합 평가 |
| 내신 관리형 | 학교 내신 대비 과목 | 중간/기말 자동 비율 반영 |
| 반복 테스트 | 매주 반복 시험 (단어 등) | 반복 템플릿 연동 |

#### 3.2.2 교재 등록 및 단원 계층 관리

**교재 등록 항목:**

| 필드 | 데이터 타입 | 필수 여부 | 설명 |
|------|------------|-----------|------|
| 교재명 | text | **필수** | 예: 쎈 수학 2학년, 자이스토리 어휘/어법 기본 |
| 과목 | uuid | **필수** | 연결 과목 (교재명 선택 시 자동 연결 가능) |
| 학년 | text | 선택 | 대상 학년 (예: 고2) |
| 출판 연도 | text | 선택 | 교재 출판 연도 (예: 2025) |
| 시작일 | date | 선택 | 교재 사용 시작일 |
| 종료일 | date | 선택 | 교재 사용 종료일 |

**단원 계층 구조:**

```
교재 (예: 자이스토리 어휘/어법 기본)
├── 대단원 (예: Ⅰ 어법)
│   ├── 중단원 (예: A 문장의 구성 요소)
│   │   ├── 소단원 (선택적)
│   │   └── 소단원
│   ├── 중단원 (예: B 문장의 형식)
│   └── 중단원 (예: C 주어와 동사의 수 일치)
├── 대단원 (예: Ⅱ 글의 흐름 속에서 의미 찾기)
│   └── 중단원 (예: S 밑줄 친 부분의 의미 찾기)
├── 대단원 (예: Ⅲ 어휘)
│   ├── 중단원 (예: T 글의 전개 방식 ①)
│   └── 중단원 (예: U 글의 전개 방식 ②)
└── 대단원 (예: 고난도 모의고사)
    ├── 중단원 (예: 1회 2025.9)
    └── 중단원 (예: 2회 2025.6)
```

**단원 등록 항목:**

| 필드 | 데이터 타입 | 필수 여부 | 설명 |
|------|------------|-----------|------|
| 단원명 | text | **필수** | 예: A 문장의 구성 요소 |
| 단원 레벨 | text | **필수** | major(대단원) / middle(중단원) / minor(소단원) |
| 상위 단원 | uuid | 선택 | 부모 단원 ID (계층 구성용) |
| 정렬 순서 | int | **필수** | 표시 순서 |

**진도율 자동 계산:**
- 해당 교재의 전체 단원 수 대비 평가가 존재하는 단원 수로 자동 계산
- 대시보드에 교재별 진도율 프로그레스 바 표시

#### 3.2.3 학습 단위 화면

- **과목 목록**: 카드 형태, 과목 색상으로 구분, 소속 학생 수/교재 수 표시
- **교재 목록**: 과목별 필터링, 진도율 프로그레스 바
- **단원 트리**: 토글 형태의 계층 트리 뷰, 드래그앤드롭으로 순서 변경 가능

---

### 3.3 평가 시스템

> 다양한 유형의 평가를 생성하고 채점 방식을 유연하게 설정한다.

#### 3.3.1 평가 생성

**평가 기본 설정:**

| 필드 | 데이터 타입 | 필수 여부 | 설명 |
|------|------------|-----------|------|
| 평가명 | text | **필수** | 직접 입력 (예: 3월 1주차 단어 시험) |
| 평가 날짜 | date | **필수** | 시험 실시일 |
| 과목 | uuid | **필수** | 연결 과목 |
| 교재 | uuid | 선택 | 연결 교재 |
| 단원 | uuid[] | 선택 | 연결 단원 (복수 선택 가능) |
| 배점 총점 | int | **필수** | 만점 기준 (예: 100) |
| 공개 여부 | boolean | **필수** | 학생 열람 가능/불가 (향후 학생 포털용) |

**평가 유형:**

| 유형 | 설명 | 예시 |
|------|------|------|
| 시험 | 정식 시험 | 중간고사, 기말고사, 모의고사 |
| 과제 | 과제 제출 평가 | 워크시트 제출, 에세이 |
| 수행평가 | 학교 수행평가 대비 | 발표, 포트폴리오 |
| 퀴즈 | 가벼운 확인 테스트 | 수업 시작 퀴즈, 쪽지시험 |
| 출석 점수 | 출석 기반 평가 | 수업 참여도 |

#### 3.3.2 평가 방식 선택

**점수형:**
- 숫자 점수 입력 (예: 85/100)
- 부분 점수 허용 여부 설정
- 소수점 허용 여부 설정

**등급형:**
- A/B/C/D/F 등급
- 1~5단계 수치 등급
- Pass/Fail 이분법

**체크형:**
- 완료/미완료
- 제출/미제출

**가중치 설정:**
- 특정 평가에 더 큰 비중 부여 가능 (예: 기말고사 40%, 중간고사 30%, 퀴즈 30%)
- 과목별 중간/기말 자동 비율 반영

#### 3.3.3 반복 평가 템플릿

매주 정기적으로 시행되는 시험을 자동 생성하는 기능.

**설정 항목:**

| 필드 | 설명 |
|------|------|
| 반복 주기 | 매주/격주/매월 |
| 요일 | 예: 매주 금요일 |
| 평가 유형 | 시험/퀴즈 |
| 대상 학생/반 | 자동 배정 대상 |
| 템플릿명 | 예: 주간 영어 단어 시험 |

**반복 템플릿 예시 (영어 단어 시험):**
- 매주 금요일 단어 시험 자동 생성
- 한/영 변환 유형 선택
- 시험지 출력 / 저장
- 점수 자동 기록 연동

---

### 3.4 학생 관리

#### 3.4.1 학생 등록 항목

| 필드 | 데이터 타입 | 필수 여부 | 설명 | 비고 |
|------|------------|-----------|------|------|
| 이름 | text | **필수** | 학생 한글 이름 | |
| 학교 | text | 선택 | 재학 중인 학교명 | |
| 학년 | text | 선택 | 학년 정보 | 자유 입력 (예: 중2, 고1) |
| 연락처 | text | 선택 | 학생 전화번호 | 010-XXXX-XXXX |
| 학부모 연락처 | text | 선택 | 학부모 전화번호 | 출결/알림 발송용 |
| 연결 과목 | uuid[] | 선택 | 수강 중인 과목 목록 | 다과목 연결 |
| 메모 | text | 선택 | 참고 메모 | |
| 활성 상태 | boolean | 자동 | 재원/퇴원 구분 | 기본값: true |

#### 3.4.2 학생 목록 화면

- **테이블 형태**로 전체 학생 표시
- 컬럼: 이름, 학교/학년, 수강 과목(색상 태그), 최근 평가 결과, 위험 등급
- **과목별 필터링**: 드롭다운으로 특정 과목 수강생만 필터
- **반별 필터링**: 드롭다운으로 특정 반만 필터
- **이름 검색**: 실시간 검색
- **활성/비활성 필터**: 재원생/퇴원생 구분
- **위험 등급 필터**: 관심/주의/위험 학생 필터
- 행 클릭 → 학생 상세 페이지로 이동

#### 3.4.3 학생 상세 페이지

```
+------------------------------------------+
| ← 뒤로     학생 상세 정보        수정 버튼 |
+------------------------------------------+
| [기본 정보 카드]                           |
|  이름: 홍길동                              |
|  학교/학년: OO고등학교 2학년               |
|  수강 과목: [영어] [수학] [과학]            |
|  연락처: 010-1234-5678                     |
|  학부모: 010-9876-5432                     |
|  위험 등급: ⚠️ 주의                        |
+------------------------------------------+
| [탭: 성적 | 출결 | 과제 | 분석]            |
+------------------------------------------+
| [성적 탭]                                  |
|  과목    | 평가명         | 점수    | 날짜  |
|  영어    | 3월 단어시험   | 85/100  | 3/7  |
|  수학    | 단원평가 3-1   | 72/100  | 3/5  |
|  ...                                      |
+------------------------------------------+
| [출결 탭]                                  |
|  날짜    | 상태   | 사유                   |
|  3/7     | 출석   |                        |
|  3/5     | 지각   | 교통 지연              |
+------------------------------------------+
| [과제 탭]                                  |
|  과제명        | 마감일  | 상태            |
|  워크시트 3-1  | 3/10   | ⬜ 예정          |
+------------------------------------------+
| [분석 탭]                                  |
|  📈 성장 추이 그래프 (과목별)              |
|  🔴 취약 영역: 수학 > 가정법 (3회 연속 60%↓)|
+------------------------------------------+
```

---

### 3.5 성적 기록 및 입력

#### 3.5.1 성적 입력 방식

**관리자/강사 직접 입력:**

```
+------------------------------------------+
| 성적 입력                                  |
+------------------------------------------+
| 평가 선택:  [3월 1주차 단어시험 ▼]          |
| 또는 새 평가 등록:  [+ 새 평가]             |
+------------------------------------------+
| 학생명      | 점수   | 전체 | 상태        |
|-------------|--------|------|------------|
| 홍길동       | [85]  | 100  | ✅ 응시    |
| 김영희       | [92]  | 100  | ✅ 응시    |
| 박철수       |  -    |  -   | 🔴 결시    |
| 이수진       | [78]  | 100  | ✅ 응시    |
+------------------------------------------+
| [일괄 저장]                                |
+------------------------------------------+
```

**학생 직접 입력 (향후 확장):**
- 단원별 5지선다 및 단답형 문제에 학생이 직접 답 입력
- 자동 정답 계산 → 점수 자동 반영

#### 3.5.2 단원별 성적 기록 구조

교재-단원 연결 성적 기록 예시:

| 교재 | 대단원 | 중단원 | 점수 | 날짜 |
|------|--------|--------|------|------|
| 자이스토리 | 어법 | C 수일치 | 8/10 | 3/10 |
| 자이스토리 | 어법 | D 시제 | 7/10 | 3/12 |
| 쎈 수학 | 방정식 | 이차방정식 | 15/20 | 3/11 |

#### 3.5.3 결시/미제출 상태 관리

**상태 유형:**

| 상태 | 설명 | 후속 처리 |
|------|------|-----------|
| 출석(응시) | 정상 응시 | 점수 입력 |
| 결석 | 당일 결석 | 보강 일정 연결 가능 |
| 지각 | 늦게 도착 | 사유 기록 |
| 미제출 | 과제 미제출 | 자동 알림 발송 |
| 보강 예정 | 보강 일정 확정 | 보강일 선택 |
| 면제 | 평가 면제 | 성적 집계에서 제외 |

**누적 결시/미제출 자동 표시:**
- 최근 3개월 결시 횟수 자동 집계
- 월별 결석률 원형 그래프
- 과제 미제출 2회 이상 → 학생 알림, 3회 이상 → 학부모 알림

---

### 3.6 분석 및 리포트

#### 3.6.1 카테고리별 성취도 그래프

**필터 옵션:**
- 과목 선택
- 교재 선택
- 학기/기간 선택 (최근 1개월, 3개월, 전체)

**그래프 유형:**

| 그래프 | 용도 | 표시 내용 |
|--------|------|-----------|
| **막대 그래프** | 단원별 비교 | 단원별 평균 점수, 반 평균 vs 개인 평균 |
| **레이더 차트** | 영역별 강/약점 | 예: 수일치 70%, 가정법 50%, 관계대명사 80%, 도치 40% |
| **히트맵** | 전체 단원 현황 | A~R 단원을 색상으로 표시 (빨강=취약, 초록=우수) |

**단원 세부 분석 (단원 클릭 시):**
- 해당 단원 시험 목록
- 최근 3회 평균
- 최고 점수 / 최저 점수
- 반 평균 대비 비교

**비교 기능:**
- 개인 vs 반 평균 (멤버별 비교)
- 이번 달 vs 지난 달 (기간별 비교)

#### 3.6.2 취약 영역 자동 표시

**기준 설정 (관리자가 커스텀 가능):**
- 평균 60% 이하 → 취약 표시
- 최근 3회 중 2회 이상 60% 이하 → 취약 표시

**자동 태깅:**
- 취약 단원 감지 시 자동 "복습 필요" 태그 표시
- 예: `가정법 3회 연속 55% 이하 → 🔴 복습 필요`

**자동 추천 (향후 고도화):**
- 취약 단원 과제 자동 추천
- 해당 단원 시험 재배정 제안
- 복습 스케줄 자동 생성 제안

#### 3.6.3 성장 추이 그래프

**시험별 점수 추이 (꺾은선 그래프):**
- X축: 시험 날짜
- Y축: 점수
- 필터: 최근 5회 / 전체 기록 / 특정 단원만

**이동 평균:**
- 최근 3회 평균선
- 최근 5회 평균선
- 안정적 상승/하락 추세 판단

**성장률 자동 계산:**
- 월별 평균 비교 → 퍼센트 변화율 표시
- 예: 1월 평균 60 → 2월 평균 70 → `+16.7% 상승`

#### 3.6.4 위험 신호 알림

**위험 조건 설정 (관리자 커스텀):**

| 조건 | 기본값 |
|------|--------|
| 최근 N회 평균 점수 이하 | 최근 3회 평균 60점 이하 |
| 결석률 초과 | 15% 이상 |
| 과제 미제출 횟수 | 3회 이상 |
| 특정 단원 반복 실패 | 동일 단원 3회 연속 기준 이하 |

**위험 등급:**

| 등급 | 색상 | 설명 |
|------|------|------|
| 관심 | 🟡 노랑 | 1개 조건 해당 |
| 주의 | 🟠 주황 | 2개 조건 해당 |
| 위험 | 🔴 빨강 | 3개 이상 조건 해당 |

**알림 방식:**
- 강사 대시보드 상단 위험 학생 배너 표시
- 위험 학생 목록 페이지에서 원인 상세 확인
- 학부모 알림 옵션 (선택적)
- 상담 필요 표시 기능

**위험 원인 자동 분석 예시:**
```
⚠️ 위험 학생: 홍길동
━━━━━━━━━━━━━━━━━━
위험 사유:
  • 최근 3회 모의고사 평균 58점
  • 가정법 단원 3회 연속 60% 이하
  • 결석 2회

권장 조치:
  • 가정법 복습 과제 배정
  • 학부모 상담 권유
```

---

### 3.7 출결 관리

#### 3.7.1 출결 체크 방식

**QR 출석:**
- 학생 개인 QR 코드 발급
- 학원 태블릿/PC로 스캔
- 출석 시간 자동 기록
- 지각 기준 시간 설정 가능 (예: 수업 시작 후 10분 초과 시 자동 지각 처리)

**PIN 번호 입력:**
- 학부모 전화번호 뒤 4자리 또는 지정 PIN 입력
- 중복 입력 방지
- 오입력 시 관리자 승인 필요

**강사 수동 체크:**
- 출석/지각/결석 드롭다운 선택
- 사유 입력란 (병결, 개인사정 등)

#### 3.7.2 출결 자동 분류

관리자 설정 가능한 시간 기준:

| 조건 | 상태 |
|------|------|
| 수업 시작 후 10분 이내 도착 | 출석 |
| 수업 시작 후 10~30분 도착 | 지각 |
| 수업 시작 후 30분 초과 | 결석 |
| 사전 연락 후 불참 | 인정 결석 |

#### 3.7.3 출결 관리 화면

```
+--------------------------------------------------+
| 출결 관리              [2026년 3월 ▼] [과목: 전체 ▼]|
+--------------------------------------------------+
| 날짜 선택: [2026-03-07]                            |
+--------------------------------------------------+
| 학생명    | 수업     | 상태      | 시간    | 사유   |
|-----------|---------|-----------|---------|--------|
| 홍길동    | 영어     | ✅ 출석   | 14:00   |        |
| 김영희    | 영어     | ⚠️ 지각  | 14:15   | 교통   |
| 박철수    | 영어     | 🔴 결석  |    -    | 병결   |
| 이수진    | 수학     | ✅ 출석   | 16:00   |        |
+--------------------------------------------------+
| 이번 달 출결 통계:                                  |
|  출석률: 87% | 지각: 5건 | 결석: 3건               |
+--------------------------------------------------+
```

---

### 3.8 과제 및 알림 자동화

#### 3.8.1 과제 등록

**과제 등록 항목:**

| 필드 | 데이터 타입 | 필수 여부 | 설명 |
|------|------------|-----------|------|
| 과제명 | text | **필수** | 예: 워크시트 3-1 |
| 과목 | uuid | **필수** | 연결 과목 |
| 단원 | uuid | 선택 | 연결 단원 |
| 대상 학생/반 | uuid[] | **필수** | 배정 대상 |
| 마감일 | datetime | **필수** | 제출 마감 |
| 제출 방식 | text | **필수** | 사진/파일/체크형 |
| 난이도 | text | 선택 | 상/중/하 |
| 필수 여부 | boolean | **필수** | 필수 과제/선택 과제 구분 |
| 설명 | text | 선택 | 과제 상세 설명 |

#### 3.8.2 자동 알림 시나리오

**마감 전 알림:**

| 시점 | 대상 | 내용 |
|------|------|------|
| 마감 1일 전 | 학생 | "내일까지 [과제명] 제출 필요" |
| 마감 3시간 전 | 학생 | "오늘 [시간]까지 [과제명] 제출 필요" |

**마감 후 알림:**

| 시점 | 대상 | 내용 |
|------|------|------|
| 마감 직후 | 미제출 학생 | "[과제명] 미제출 알림" |
| 마감 24시간 후 | 미제출 학생 | "[과제명] 재알림" |
| 누적 미제출 3회 | 학부모 | "과제 미제출 누적 알림" |

**시험 리마인드:**

| 시점 | 대상 | 내용 |
|------|------|------|
| 시험 2일 전 | 학생 | "[시험명] D-2 알림 + 시험 범위 첨부" |
| 시험 3시간 전 | 학생 | "[시험명] 곧 시작 리마인드" |

**복습 리마인드:**
- 특정 단원 60% 이하 → 복습 과제 자동 배정 + 알림
- 동일 유형 3회 연속 실패 → 복습 리마인드 발송

#### 3.8.3 과제 제출 관리 (향후 학생 포털)

- 사진 업로드
- 파일 첨부
- 체크 완료 표시
- 강사 피드백 입력
- 수정 후 재제출 가능

**과제 이행률 자동 계산:**
- 학생별 제출률 %
- 반 평균 제출률
- 과제 누적 미제출 수

#### 3.8.4 학부모 알림 자동화

**알림 유형 (학원이 선택적으로 활성화):**

| 알림 유형 | 발송 시점 | 기본 설정 |
|-----------|-----------|-----------|
| 출결 알림 | 출석/지각/결석 시 | ON |
| 시험 결과 알림 | 채점 완료 시 | ON |
| 과제 미제출 알림 | 미제출 누적 시 | ON |
| 상담 요청 알림 | 강사 요청 시 | OFF |
| 월간 리포트 | 매월 1일 | OFF |

**알림 방식 (MVP):**
- 앱 내 알림 (향후 학부모 포털)
- 이메일

**알림 방식 (향후 확장):**
- 카카오톡 알림톡
- 문자 (SMS)
- 앱 푸시

**학부모 열람 로그 (향후 확장):**
- 리포트 열람 여부 기록
- 미열람 시 강사에게 알림

---

### 3.9 학원 설정

#### 3.9.1 학원 기본 정보

| 항목 | 설명 |
|------|------|
| 학원명 | 수정 가능 |
| 학원 유형 | 종합학원/입시학원/단과학원 |
| 연락처 | 수정 가능 |
| 학원 로고 | 이미지 업로드 |
| 수업 시간 설정 | 교시별 시작/종료 시간 (출결 기준) |

#### 3.9.2 강사 계정 관리

- 현재 등록된 강사 목록 (이름, 이메일, 담당 과목, 가입일)
- 새 강사 초대 (이메일 + 담당 과목 선택)
- 강사 계정 비활성화/삭제

#### 3.9.3 평가 설정

- 취약 영역 기준값 설정 (기본: 60%)
- 위험 신호 조건 커스텀
- 출결 시간 기준 설정 (지각/결석 기준 분)

#### 3.9.4 알림 설정

- 학부모 알림 유형 ON/OFF 토글
- 알림 발송 방식 선택
- 월간 리포트 자동 발송 ON/OFF

---

## 4. 데이터베이스 설계

### 4.1 테이블 목록

| # | 테이블명 | 설명 | 비고 |
|---|----------|------|------|
| 1 | academies | 학원 정보 | 멀티테넌트 핵심 |
| 2 | profiles | 사용자 프로필 (관리자/강사) | Supabase Auth와 연결 |
| 3 | subjects | 과목 정보 | 과목 유형, 색상 등 |
| 4 | textbooks | 교재 정보 | 과목과 1:N |
| 5 | chapters | 단원 정보 (대/중/소) | 자기참조 계층 구조 |
| 6 | students | 학생 정보 | |
| 7 | student_subjects | 학생-과목 매핑 | 다대다 |
| 8 | classes | 반(클래스) 정보 | |
| 9 | class_students | 반-학생 매핑 | 다대다 |
| 10 | assessments | 평가 정보 | 시험/과제/퀴즈 등 |
| 11 | assessment_templates | 반복 평가 템플릿 | 자동 생성용 |
| 12 | scores | 성적 기록 | |
| 13 | attendance | 출결 기록 | |
| 14 | assignments | 과제 정보 | |
| 15 | assignment_submissions | 과제 제출 기록 | 향후 확장 |
| 16 | notifications | 알림 기록 | |
| 17 | risk_alerts | 위험 신호 기록 | |
| 18 | academy_settings | 학원별 설정 | 위험 기준, 알림 등 |

### 4.2 테이블 상세 스키마

#### academies (학원)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK, default gen_random_uuid() | |
| name | text | NOT NULL | 학원명 |
| slug | text | UNIQUE, NOT NULL | URL 슬러그 |
| type | text | NOT NULL, default 'general' | 학원 유형 |
| phone | text | | 학원 연락처 |
| logo_url | text | | 로고 이미지 URL |
| created_at | timestamptz | default now() | 생성일 |

- type CHECK: 'general'(종합), 'entrance_exam'(입시), 'single_subject'(단과)

#### profiles (사용자 프로필)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK, FK → auth.users(id) | Supabase Auth 유저와 1:1 |
| academy_id | uuid | FK → academies(id), NOT NULL | 소속 학원 |
| name | text | NOT NULL | 사용자 이름 |
| email | text | NOT NULL | 이메일 |
| role | text | NOT NULL, CHECK (admin/teacher) | 역할 |
| created_at | timestamptz | default now() | 생성일 |

#### subjects (과목)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK | |
| academy_id | uuid | FK → academies(id), NOT NULL | 소속 학원 |
| name | text | NOT NULL | 과목명 |
| color | text | NOT NULL, default '#3B82F6' | 대시보드 구분 색상 |
| icon | text | | 아이콘 식별자 |
| type | text | NOT NULL, default 'regular' | 과목 유형 |
| grade_weight | jsonb | | 평가 유형별 가중치 |
| sort_order | int | default 0 | 정렬 순서 |
| is_active | boolean | default true | 활성 여부 |
| created_at | timestamptz | default now() | 생성일 |

- type CHECK: 'regular', 'special_lecture', 'camp', 'performance', 'project', 'school_exam', 'repeat_test'

#### textbooks (교재)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK | |
| academy_id | uuid | FK → academies(id), NOT NULL | 소속 학원 |
| subject_id | uuid | FK → subjects(id), NOT NULL | 연결 과목 |
| name | text | NOT NULL | 교재명 |
| grade | text | | 대상 학년 |
| publish_year | text | | 출판 연도 |
| start_date | date | | 사용 시작일 |
| end_date | date | | 사용 종료일 |
| sort_order | int | default 0 | 정렬 순서 |
| created_at | timestamptz | default now() | 생성일 |

#### chapters (단원)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK | |
| textbook_id | uuid | FK → textbooks(id) ON DELETE CASCADE, NOT NULL | 소속 교재 |
| parent_id | uuid | FK → chapters(id) ON DELETE CASCADE | 상위 단원 (null이면 대단원) |
| name | text | NOT NULL | 단원명 |
| level | text | NOT NULL | 단원 레벨 |
| sort_order | int | NOT NULL, default 0 | 정렬 순서 |
| created_at | timestamptz | default now() | 생성일 |

- level CHECK: 'major'(대단원), 'middle'(중단원), 'minor'(소단원)
- 자기참조 FK로 계층 구조 구현

#### students (학생)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK | |
| academy_id | uuid | FK → academies(id), NOT NULL | 소속 학원 |
| name | text | NOT NULL | 학생 이름 |
| phone | text | | 학생 연락처 |
| parent_phone | text | | 학부모 연락처 |
| school | text | | 학교명 |
| grade | text | | 학년 |
| pin_code | text | | 출결 PIN 코드 |
| memo | text | | 메모 |
| is_active | boolean | default true | 재원 여부 |
| created_at | timestamptz | default now() | 생성일 |

#### student_subjects (학생-과목 매핑)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK | |
| student_id | uuid | FK → students(id) ON DELETE CASCADE | |
| subject_id | uuid | FK → subjects(id) ON DELETE CASCADE | |
| created_at | timestamptz | default now() | |

- UNIQUE 제약조건: (student_id, subject_id)

#### classes (반)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK | |
| academy_id | uuid | FK → academies(id), NOT NULL | 소속 학원 |
| name | text | NOT NULL | 반 이름 |
| subject_id | uuid | FK → subjects(id) | 연결 과목 (선택) |
| description | text | | 설명 |
| sort_order | int | default 0 | 정렬 순서 |
| created_at | timestamptz | default now() | 생성일 |

#### class_students (반-학생 매핑)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK | |
| class_id | uuid | FK → classes(id) ON DELETE CASCADE | |
| student_id | uuid | FK → students(id) ON DELETE CASCADE | |
| created_at | timestamptz | default now() | |

- UNIQUE 제약조건: (class_id, student_id)

#### assessments (평가)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK | |
| academy_id | uuid | FK → academies(id), NOT NULL | 소속 학원 |
| subject_id | uuid | FK → subjects(id), NOT NULL | 연결 과목 |
| textbook_id | uuid | FK → textbooks(id) | 연결 교재 |
| template_id | uuid | FK → assessment_templates(id) | 반복 템플릿 연결 |
| name | text | NOT NULL | 평가명 |
| assessment_date | date | NOT NULL | 평가일 |
| assessment_type | text | NOT NULL | 평가 유형 |
| scoring_method | text | NOT NULL, default 'score' | 채점 방식 |
| total_score | int | | 배점 총점 (점수형) |
| is_public | boolean | default false | 학생 공개 여부 |
| weight | decimal(3,2) | default 1.00 | 가중치 |
| created_by | uuid | FK → profiles(id) | 생성자 |
| created_at | timestamptz | default now() | 생성일 |

- assessment_type CHECK: 'exam', 'assignment', 'performance', 'quiz', 'attendance_score'
- scoring_method CHECK: 'score'(점수형), 'grade'(등급형), 'check'(체크형)

#### assessment_chapters (평가-단원 매핑)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK | |
| assessment_id | uuid | FK → assessments(id) ON DELETE CASCADE | |
| chapter_id | uuid | FK → chapters(id) ON DELETE CASCADE | |

- UNIQUE 제약조건: (assessment_id, chapter_id)

#### assessment_templates (반복 평가 템플릿)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK | |
| academy_id | uuid | FK → academies(id), NOT NULL | 소속 학원 |
| subject_id | uuid | FK → subjects(id), NOT NULL | 연결 과목 |
| name | text | NOT NULL | 템플릿명 |
| recurrence | text | NOT NULL | 반복 주기 |
| day_of_week | int | | 요일 (0=일, 6=토) |
| assessment_type | text | NOT NULL | 평가 유형 |
| scoring_method | text | NOT NULL, default 'score' | 채점 방식 |
| total_score | int | | 배점 총점 |
| is_active | boolean | default true | 활성 여부 |
| created_at | timestamptz | default now() | 생성일 |

- recurrence CHECK: 'weekly', 'biweekly', 'monthly'

#### scores (성적)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK | |
| academy_id | uuid | FK → academies(id), NOT NULL | 소속 학원 |
| assessment_id | uuid | FK → assessments(id), NOT NULL | 연결 평가 |
| student_id | uuid | FK → students(id), NOT NULL | 학생 |
| score_value | decimal(7,2) | | 점수 (점수형) |
| grade_value | text | | 등급 (등급형) |
| check_value | boolean | | 완료 여부 (체크형) |
| status | text | NOT NULL, default 'completed' | 응시 상태 |
| memo | text | | 메모 |
| recorded_by | uuid | FK → profiles(id) | 입력자 |
| created_at | timestamptz | default now() | 생성일 |

- status CHECK: 'completed'(응시), 'absent'(결시), 'late'(지각), 'not_submitted'(미제출), 'makeup_scheduled'(보강예정), 'exempted'(면제)

#### attendance (출결)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK | |
| academy_id | uuid | FK → academies(id), NOT NULL | 소속 학원 |
| student_id | uuid | FK → students(id), NOT NULL | 학생 |
| subject_id | uuid | FK → subjects(id) | 수업 과목 |
| attendance_date | date | NOT NULL | 날짜 |
| status | text | NOT NULL | 출결 상태 |
| check_in_time | timestamptz | | 체크인 시간 |
| check_method | text | | 체크 방식 |
| reason | text | | 사유 |
| recorded_by | uuid | FK → profiles(id) | 기록자 |
| created_at | timestamptz | default now() | 생성일 |

- status CHECK: 'present'(출석), 'late'(지각), 'absent'(결석), 'excused'(인정결석)
- check_method CHECK: 'qr', 'pin', 'manual'

#### assignments (과제)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK | |
| academy_id | uuid | FK → academies(id), NOT NULL | 소속 학원 |
| subject_id | uuid | FK → subjects(id), NOT NULL | 연결 과목 |
| chapter_id | uuid | FK → chapters(id) | 연결 단원 |
| title | text | NOT NULL | 과제명 |
| description | text | | 과제 설명 |
| due_date | timestamptz | NOT NULL | 마감일시 |
| submission_type | text | NOT NULL, default 'check' | 제출 방식 |
| difficulty | text | | 난이도 |
| is_required | boolean | default true | 필수 여부 |
| created_by | uuid | FK → profiles(id) | 생성자 |
| created_at | timestamptz | default now() | 생성일 |

- submission_type CHECK: 'photo', 'file', 'check'
- difficulty CHECK: 'easy', 'medium', 'hard'

#### assignment_students (과제-학생 배정)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK | |
| assignment_id | uuid | FK → assignments(id) ON DELETE CASCADE | |
| student_id | uuid | FK → students(id) ON DELETE CASCADE | |
| status | text | NOT NULL, default 'pending' | 제출 상태 |
| submitted_at | timestamptz | | 제출 일시 |
| feedback | text | | 강사 피드백 |
| created_at | timestamptz | default now() | |

- status CHECK: 'pending'(예정), 'submitted'(제출), 'not_submitted'(미제출), 'resubmit'(재제출 요청)

#### notifications (알림)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK | |
| academy_id | uuid | FK → academies(id), NOT NULL | 소속 학원 |
| student_id | uuid | FK → students(id) | 대상 학생 |
| type | text | NOT NULL | 알림 유형 |
| channel | text | NOT NULL, default 'in_app' | 발송 채널 |
| title | text | NOT NULL | 알림 제목 |
| message | text | NOT NULL | 알림 내용 |
| is_sent | boolean | default false | 발송 여부 |
| sent_at | timestamptz | | 발송 시간 |
| is_read | boolean | default false | 읽음 여부 |
| read_at | timestamptz | | 읽은 시간 |
| created_at | timestamptz | default now() | 생성일 |

- type CHECK: 'attendance', 'score', 'assignment', 'reminder', 'risk_alert', 'monthly_report'
- channel CHECK: 'in_app', 'email', 'sms', 'kakao'

#### risk_alerts (위험 신호)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK | |
| academy_id | uuid | FK → academies(id), NOT NULL | 소속 학원 |
| student_id | uuid | FK → students(id), NOT NULL | 대상 학생 |
| risk_level | text | NOT NULL | 위험 등급 |
| reasons | jsonb | NOT NULL | 위험 사유 목록 |
| is_resolved | boolean | default false | 해결 여부 |
| resolved_at | timestamptz | | 해결 일시 |
| resolved_by | uuid | FK → profiles(id) | 해결 처리자 |
| created_at | timestamptz | default now() | 생성일 |

- risk_level CHECK: 'concern'(관심), 'caution'(주의), 'danger'(위험)

#### academy_settings (학원 설정)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK | |
| academy_id | uuid | FK → academies(id), UNIQUE, NOT NULL | 소속 학원 |
| weak_threshold | int | default 60 | 취약 기준 점수 (%) |
| risk_score_threshold | int | default 60 | 위험 점수 기준 |
| risk_score_count | int | default 3 | 위험 판단 최근 N회 |
| risk_absence_rate | int | default 15 | 위험 결석률 (%) |
| risk_missing_count | int | default 3 | 위험 미제출 횟수 |
| late_threshold_min | int | default 10 | 지각 기준 (분) |
| absent_threshold_min | int | default 30 | 결석 기준 (분) |
| notify_attendance | boolean | default true | 출결 알림 |
| notify_score | boolean | default true | 성적 알림 |
| notify_assignment | boolean | default true | 과제 알림 |
| notify_monthly_report | boolean | default false | 월간 리포트 |
| created_at | timestamptz | default now() | 생성일 |
| updated_at | timestamptz | default now() | 수정일 |

### 4.3 ER 관계도 요약

```
academies ─┬─< profiles (1:N)
           ├─< subjects (1:N)
           ├─< textbooks (1:N, via subjects)
           ├─< students (1:N)
           ├─< classes (1:N)
           ├─< assessments (1:N)
           ├─< scores (1:N)
           ├─< attendance (1:N)
           ├─< assignments (1:N)
           ├─< notifications (1:N)
           ├─< risk_alerts (1:N)
           └── academy_settings (1:1)

subjects ──┬─< textbooks (1:N)
           ├─< assessments (1:N)
           ├─< attendance (1:N)
           └─< assignments (1:N)

textbooks ──< chapters (1:N)
chapters ──< chapters (자기참조, 계층 구조)

students >──< subjects (N:M, via student_subjects)
students >──< classes (N:M, via class_students)
students ──< scores (1:N)
students ──< attendance (1:N)
students ──< risk_alerts (1:N)

assessments >──< chapters (N:M, via assessment_chapters)
assessments ──< scores (1:N)

assignments ──< assignment_students (1:N)
```

### 4.4 RLS (Row Level Security) 정책

모든 테이블에 `academy_id` 기반 RLS 정책 적용:

| 작업 | 정책 |
|------|------|
| SELECT | `academy_id = (현재 로그인 유저의 academy_id)` |
| INSERT | `academy_id = (현재 로그인 유저의 academy_id)` |
| UPDATE | `academy_id = (현재 로그인 유저의 academy_id)` |
| DELETE | `academy_id = (현재 로그인 유저의 academy_id)` + `role = 'admin'` (관리자만 삭제) |

**구현 방식:**
- `profiles` 테이블에서 현재 `auth.uid()`의 `academy_id`를 조회하는 헬퍼 함수 생성
- 모든 RLS 정책에서 이 함수를 활용하여 데이터 격리

### 4.5 인덱스 전략

| 테이블 | 인덱스 대상 | 이유 |
|--------|------------|------|
| profiles | academy_id | 학원별 유저 조회 |
| subjects | academy_id, is_active | 학원별 활성 과목 조회 |
| textbooks | subject_id | 과목별 교재 조회 |
| chapters | textbook_id, sort_order | 교재 내 단원 정렬 조회 |
| chapters | parent_id | 하위 단원 조회 |
| students | academy_id, is_active | 학원별 재원생 조회 |
| class_students | class_id, student_id | 반별 학생 조회 |
| student_subjects | student_id, subject_id | 학생별 과목 조회 |
| assessments | academy_id, subject_id, assessment_date | 과목별 날짜 조회 |
| scores | student_id, assessment_id | 학생별 평가 점수 조회 |
| scores | academy_id, assessment_id | 학원별 평가별 점수 조회 |
| attendance | academy_id, attendance_date | 학원별 날짜 출결 조회 |
| attendance | student_id, attendance_date | 학생별 출결 이력 |
| assignments | academy_id, due_date | 학원별 마감일 조회 |
| risk_alerts | academy_id, is_resolved | 학원별 미해결 위험 조회 |
| notifications | academy_id, is_sent | 미발송 알림 조회 |

---

## 5. 화면 설계 (Wireframe 명세)

### 5.1 전체 레이아웃 구조

```
+--------------------------------------------------+
| 사이드바 (260px)     |  메인 콘텐츠 영역            |
|                      |                             |
| [학원 로고/이름]      |  헤더 바                     |
|                      |  - 페이지 제목               |
| 📊 대시보드          |  - 위험 학생 알림 배지        |
| ─────────────        |  - 액션 버튼 (우측)           |
| 📚 학습 관리 ▾       |                             |
|   ├ 과목 관리         |  콘텐츠 본문                  |
|   ├ 교재/단원         |  (각 페이지별 내용)           |
|   └ 평가 관리         |                             |
| 👥 학생 관리         |                             |
| 🏫 반 관리           |                             |
| 💯 성적 관리 ▾       |                             |
|   ├ 성적 입력         |                             |
|   └ 성적 이력         |                             |
| 📈 분석/리포트       |                             |
| 📅 출결 관리         |                             |
| 📝 과제 관리         |                             |
| 🔔 알림              |                             |
| ─────────────        |                             |
| ⚙️ 설정              |                             |
| 🚪 로그아웃          |                             |
+--------------------------------------------------+
```

**반응형 동작:**
- 데스크탑 (1024px 이상): 사이드바 항상 표시
- 태블릿 (768px~1023px): 사이드바 접기/펼치기 가능
- 모바일 (768px 미만): 사이드바 숨김, 햄버거 메뉴로 전환

### 5.2 주요 화면 라우팅 구조

| 경로 | 화면명 | 인증 필요 | 레이아웃 |
|------|--------|----------|----------|
| `/` | 랜딩 페이지 | ❌ | 별도 레이아웃 |
| `/login` | 로그인 | ❌ | 인증 레이아웃 |
| `/signup` | 회원가입 | ❌ | 인증 레이아웃 |
| `/dashboard` | 대시보드 | ✅ | 사이드바 레이아웃 |
| **학습 관리** | | | |
| `/subjects` | 과목 관리 | ✅ | 사이드바 레이아웃 |
| `/subjects/new` | 과목 등록 | ✅ | 사이드바 레이아웃 |
| `/subjects/[id]` | 과목 상세 | ✅ | 사이드바 레이아웃 |
| `/textbooks` | 교재 목록 | ✅ | 사이드바 레이아웃 |
| `/textbooks/new` | 교재 등록 | ✅ | 사이드바 레이아웃 |
| `/textbooks/[id]` | 교재 상세 (단원 트리) | ✅ | 사이드바 레이아웃 |
| `/assessments` | 평가 목록 | ✅ | 사이드바 레이아웃 |
| `/assessments/new` | 평가 생성 | ✅ | 사이드바 레이아웃 |
| `/assessments/[id]` | 평가 상세 (채점) | ✅ | 사이드바 레이아웃 |
| `/assessments/templates` | 반복 템플릿 관리 | ✅ | 사이드바 레이아웃 |
| **학생 관리** | | | |
| `/students` | 학생 목록 | ✅ | 사이드바 레이아웃 |
| `/students/new` | 학생 등록 | ✅ | 사이드바 레이아웃 |
| `/students/[id]` | 학생 상세 | ✅ | 사이드바 레이아웃 |
| `/students/[id]/edit` | 학생 수정 | ✅ | 사이드바 레이아웃 |
| `/classes` | 반 관리 | ✅ | 사이드바 레이아웃 |
| **성적 관리** | | | |
| `/scores` | 성적 입력 | ✅ | 사이드바 레이아웃 |
| `/scores/history` | 성적 이력 | ✅ | 사이드바 레이아웃 |
| **분석** | | | |
| `/analytics` | 분석 대시보드 | ✅ | 사이드바 레이아웃 |
| `/analytics/student/[id]` | 학생별 분석 | ✅ | 사이드바 레이아웃 |
| `/analytics/risks` | 위험 학생 목록 | ✅ | 사이드바 레이아웃 |
| **운영** | | | |
| `/attendance` | 출결 관리 | ✅ | 사이드바 레이아웃 |
| `/attendance/check` | 출결 체크 (QR/PIN) | ✅ | 전체 화면 |
| `/assignments` | 과제 관리 | ✅ | 사이드바 레이아웃 |
| `/assignments/new` | 과제 등록 | ✅ | 사이드바 레이아웃 |
| `/notifications` | 알림 관리 | ✅ | 사이드바 레이아웃 |
| **설정** | | | |
| `/settings` | 학원 설정 | ✅ | 사이드바 레이아웃 |
| `/settings/teachers` | 강사 관리 | ✅ | 사이드바 레이아웃 |
| `/settings/alerts` | 위험 기준 설정 | ✅ | 사이드바 레이아웃 |
| `/settings/notifications` | 알림 설정 | ✅ | 사이드바 레이아웃 |

### 5.3 대시보드 화면

```
+--------------------------------------------------+
| 대시보드                            [2026년 3월]   |
+--------------------------------------------------+
| +----------+ +----------+ +----------+ +--------+ |
| |👥 학생 수 | |📚 과목 수 | |📝 이번달  | |📈 평균 | |
| |   48명    | |   6개    | | 평가 32건 | | 78.5% | |
| +----------+ +----------+ +----------+ +--------+ |
+--------------------------------------------------+
| [⚠️ 위험 신호 학생]                               |
| 🔴 홍길동 - 수학 3회 평균 58점, 결석 2회           |
| 🟠 김영희 - 영어 가정법 3회 연속 60% 이하          |
| 🟡 박철수 - 과제 미제출 3회                        |
+--------------------------------------------------+
| [📅 오늘의 스케줄]         | [📊 최근 성적 입력]    |
| 14:00 영어 - 고2A반       | 3/7 영어 단어시험      |
| 16:00 수학 - 고2B반       |   평균: 82.3%          |
| 18:00 과학 - 중3A반       | 3/5 수학 단원평가      |
|                           |   평균: 71.5%          |
+--------------------------------------------------+
| [📚 교재별 진도율]                                 |
| 자이스토리 어법    ████████░░ 78%                  |
| 쎈 수학 2학년      ██████░░░░ 55%                  |
| 과학 탐구 실험     ████░░░░░░ 40%                  |
+--------------------------------------------------+
```

---

## 6. 기술 아키텍처

### 6.1 시스템 구성도

```
[사용자 브라우저]
       ↓ HTTPS
[Vercel - Next.js App]
  ├── App Router (React Server Components)
  ├── Server Actions (서버 사이드 로직)
  └── API Routes (Cron Jobs, Webhook)
       ↓
[Supabase]
  ├── Auth (이메일/비밀번호 인증)
  ├── PostgreSQL (데이터베이스 + RLS)
  ├── Storage (학원 로고, 과제 첨부파일)
  ├── Edge Functions (반복 평가 자동 생성, 알림 발송)
  └── Realtime (실시간 출결 업데이트)
       ↓
[외부 서비스]
  ├── VocaBox API (단어 시험 연동)
  ├── 이메일 (Supabase 내장 or Resend)
  └── 카카오 알림톡 (향후 확장)
```

### 6.2 기술 스택 상세

| 카테고리 | 기술 | 버전 | 용도 |
|----------|------|------|------|
| 프레임워크 | Next.js (App Router) | 14+ | 풀스택 웹 프레임워크 |
| 언어 | TypeScript | 5+ | 정적 타입 체크 |
| UI 라이브러리 | shadcn/ui | latest | 재사용 가능한 UI 컴포넌트 |
| 스타일링 | Tailwind CSS | 3+ | 유틸리티 CSS |
| DB | Supabase (PostgreSQL) | - | 메인 데이터베이스 |
| ORM/Client | Supabase JS Client | 2+ | DB 쿼리 + 인증 |
| 인증 | Supabase Auth | - | 이메일/비밀번호 인증 |
| 차트 | Recharts | 2+ | 성적 그래프, 레이더 차트, 히트맵 |
| 캘린더 | react-day-picker | - | 출결/과제 캘린더 |
| 폼 관리 | react-hook-form | 7+ | 폼 상태 관리 |
| 유효성 검사 | zod | 3+ | 스키마 기반 유효성 검사 |
| 상태 관리 | nuqs | - | URL 기반 상태 (필터 등) |
| QR 코드 | qrcode.react + html5-qrcode | - | QR 생성/스캔 |
| 배포 | Vercel | - | 호스팅 + Cron Jobs |

### 6.3 프로젝트 디렉토리 구조

```
eduops/
├── docs/
│   └── 기획서_EduOps.md
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   │
│   │   ├── (main)/
│   │   │   ├── layout.tsx                 (사이드바 레이아웃)
│   │   │   ├── dashboard/page.tsx
│   │   │   │
│   │   │   ├── subjects/
│   │   │   │   ├── page.tsx               (과목 목록)
│   │   │   │   ├── new/page.tsx           (과목 등록)
│   │   │   │   └── [id]/page.tsx          (과목 상세)
│   │   │   │
│   │   │   ├── textbooks/
│   │   │   │   ├── page.tsx               (교재 목록)
│   │   │   │   ├── new/page.tsx           (교재 등록)
│   │   │   │   └── [id]/page.tsx          (교재 상세 + 단원 트리)
│   │   │   │
│   │   │   ├── assessments/
│   │   │   │   ├── page.tsx               (평가 목록)
│   │   │   │   ├── new/page.tsx           (평가 생성)
│   │   │   │   ├── [id]/page.tsx          (평가 상세 + 채점)
│   │   │   │   └── templates/page.tsx     (반복 템플릿)
│   │   │   │
│   │   │   ├── students/
│   │   │   │   ├── page.tsx               (학생 목록)
│   │   │   │   ├── new/page.tsx           (학생 등록)
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx           (학생 상세)
│   │   │   │       └── edit/page.tsx      (학생 수정)
│   │   │   │
│   │   │   ├── classes/page.tsx           (반 관리)
│   │   │   │
│   │   │   ├── scores/
│   │   │   │   ├── page.tsx               (성적 입력)
│   │   │   │   └── history/page.tsx       (성적 이력)
│   │   │   │
│   │   │   ├── analytics/
│   │   │   │   ├── page.tsx               (분석 대시보드)
│   │   │   │   ├── student/[id]/page.tsx  (학생별 분석)
│   │   │   │   └── risks/page.tsx         (위험 학생)
│   │   │   │
│   │   │   ├── attendance/
│   │   │   │   ├── page.tsx               (출결 관리)
│   │   │   │   └── check/page.tsx         (출결 체크)
│   │   │   │
│   │   │   ├── assignments/
│   │   │   │   ├── page.tsx               (과제 관리)
│   │   │   │   └── new/page.tsx           (과제 등록)
│   │   │   │
│   │   │   ├── notifications/page.tsx     (알림 관리)
│   │   │   │
│   │   │   └── settings/
│   │   │       ├── page.tsx               (학원 설정)
│   │   │       ├── teachers/page.tsx      (강사 관리)
│   │   │       ├── alerts/page.tsx        (위험 기준)
│   │   │       └── notifications/page.tsx (알림 설정)
│   │   │
│   │   ├── page.tsx                       (랜딩 페이지)
│   │   ├── layout.tsx                     (루트 레이아웃)
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                            (shadcn/ui)
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   └── header.tsx
│   │   ├── subjects/
│   │   │   └── subject-form.tsx
│   │   ├── textbooks/
│   │   │   ├── textbook-form.tsx
│   │   │   └── chapter-tree.tsx
│   │   ├── assessments/
│   │   │   ├── assessment-form.tsx
│   │   │   └── scoring-table.tsx
│   │   ├── students/
│   │   │   ├── student-form.tsx
│   │   │   └── student-table.tsx
│   │   ├── scores/
│   │   │   ├── score-input-table.tsx
│   │   │   └── score-chart.tsx
│   │   ├── analytics/
│   │   │   ├── radar-chart.tsx
│   │   │   ├── heatmap.tsx
│   │   │   ├── growth-chart.tsx
│   │   │   └── risk-card.tsx
│   │   ├── attendance/
│   │   │   ├── attendance-table.tsx
│   │   │   └── qr-scanner.tsx
│   │   └── assignments/
│   │       ├── assignment-form.tsx
│   │       └── submission-list.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── actions/
│   │   │   ├── auth.ts
│   │   │   ├── subjects.ts
│   │   │   ├── textbooks.ts
│   │   │   ├── chapters.ts
│   │   │   ├── assessments.ts
│   │   │   ├── students.ts
│   │   │   ├── classes.ts
│   │   │   ├── scores.ts
│   │   │   ├── attendance.ts
│   │   │   ├── assignments.ts
│   │   │   ├── notifications.ts
│   │   │   ├── analytics.ts
│   │   │   └── settings.ts
│   │   └── utils/
│   │       ├── risk-calculator.ts         (위험 신호 계산)
│   │       ├── analytics.ts               (분석 유틸)
│   │       └── date.ts
│   │
│   └── types/
│       ├── database.ts
│       └── index.ts
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql
│
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── .env.local
```

---

## 7. VocaBox 연동 설계

### 7.1 연동 개요

EduOps와 VocaBox(AiVoca)는 **별도 서비스**로 독립 운영되며, 동일 학원이 두 서비스를 모두 사용할 경우 데이터를 연동한다.

### 7.2 연동 방식

**API 기반 연동:**

```
[EduOps]                          [VocaBox]
    │                                  │
    ├── 학원 연결 요청 ───────────────→│
    │   (academy_id + API Key)         │
    │                                  │
    │←──── 연결 승인 + 토큰 ──────────┤
    │                                  │
    │── 단어 시험 점수 조회 ──────────→│
    │←──── 점수 데이터 반환 ──────────┤
    │                                  │
    │── 점수를 EduOps 성적에 반영      │
```

### 7.3 연동 데이터

| 데이터 | 방향 | 설명 |
|--------|------|------|
| 학생 목록 | EduOps → VocaBox | EduOps 학생을 VocaBox에 동기화 |
| 단어 시험 점수 | VocaBox → EduOps | VocaBox 점수를 EduOps 영어 과목 성적에 반영 |
| 출력 기록 | VocaBox → EduOps | 시험지 출력 이력 연동 |

### 7.4 연동 설정 화면

- 설정 > VocaBox 연동 메뉴
- VocaBox API Key 입력
- 학생 매칭 (EduOps 학생 ↔ VocaBox 학생)
- 동기화 주기 설정 (수동 / 매일 자동)
- 연결 과목 선택 (영어 과목에 매핑)

---

## 8. 비즈니스 모델

### 8.1 가격 정책 (안)

| 플랜 | 월 요금 | 학생 수 | 과목 수 | 주요 기능 |
|------|---------|---------|---------|-----------|
| **무료** | 0원 | 20명 | 3개 | 기본 학습단위/평가/성적 관리 |
| **기본** | 5~7만원 | 100명 | 무제한 | 무료 + 분석 리포트, 출결 관리, 알림, 강사 3명 |
| **프로** | 10~15만원 | 무제한 | 무제한 | 기본 + VocaBox 연동, 학부모 알림, 강사 무제한, 월간 리포트 |

> **참고:** 가격은 시장 반응 보면서 조정. MVP 단계에서는 무료로 운영하면서 피드백 수집.

### 8.2 Go-to-Market 전략

1. **자체 검증 (1~2개월)**
   - 우리 학원에서 실제 업무에 적용
   - 다과목 운영 시나리오 검증
   - 강사/관리자 양쪽 UX 검증

2. **포트폴리오 제작**
   - 실제 운영 화면 스크린샷/영상으로 데모 자료 제작
   - VocaBox + EduOps 시너지 시연 자료

3. **직접 영업**
   - 인근 종합학원 / 입시학원 방문 제안
   - 1개월 무료 체험 제공
   - 기존 VocaBox 사용 학원 대상 업셀링

4. **확장**
   - VocaBox 사용자 → EduOps 전환/병행 사용 유도
   - 학원 커뮤니티/카페에서 홍보

---

## 9. 개발 로드맵

### Phase 1: 기초 세팅 (예상 1주)

| 작업 | 상세 내용 |
|------|-----------|
| 프로젝트 초기화 | Next.js + TypeScript + Tailwind + shadcn/ui 설정 |
| Supabase 설정 | 프로젝트 생성, DB 마이그레이션(18개 테이블), RLS 정책 |
| 인증 구현 | 로그인/회원가입 페이지, 학원 등록 플로우 |
| 레이아웃 구현 | 사이드바(그룹 메뉴) + 메인 콘텐츠 레이아웃, 반응형 |
| 인증 미들웨어 | 비로그인 사용자 리다이렉트, 세션 관리 |

### Phase 2: 학습 단위 + 학생 CRUD (예상 2주)

| 작업 | 상세 내용 |
|------|-----------|
| 과목 관리 | 과목 CRUD, 유형 선택, 색상/아이콘 설정 |
| 교재 관리 | 교재 CRUD, 과목 연결 |
| 단원 관리 | 계층형 단원 트리 CRUD (대/중/소단원) |
| 학생 관리 | 학생 CRUD, 과목 연결, 검색/필터 |
| 반 관리 | 반 CRUD, 학생 배정/해제 |

### Phase 3: 평가 + 성적 (예상 2주)

| 작업 | 상세 내용 |
|------|-----------|
| 평가 생성 | 평가 유형/방식 선택, 교재-단원 연결 |
| 반복 템플릿 | 반복 평가 템플릿 CRUD, 자동 생성 로직 |
| 성적 입력 | 개별/일괄 입력, 결시/미제출 상태 관리 |
| 성적 이력 | 필터별 조회, 단원별 기록 |

### Phase 4: 분석 + 리포트 (예상 1~2주)

| 작업 | 상세 내용 |
|------|-----------|
| 성취도 그래프 | 막대 그래프, 레이더 차트, 히트맵 (Recharts) |
| 취약 영역 | 취약 단원 자동 감지 + 태깅 |
| 성장 추이 | 꺾은선 그래프, 이동 평균, 성장률 계산 |
| 위험 신호 | 조건 기반 자동 감지, 위험 등급, 대시보드 표시 |
| 대시보드 | 종합 현황, 위험 학생 배너, 오늘 스케줄, 진도율 |

### Phase 5: 운영 자동화 (예상 1~2주)

| 작업 | 상세 내용 |
|------|-----------|
| 출결 관리 | QR/PIN/수동 출결 체크, 자동 분류, 통계 |
| 과제 관리 | 과제 등록, 학생 배정, 이행률 |
| 알림 시스템 | 자동 알림 시나리오, 알림 기록 |
| 학부모 알림 | 이메일 기반 알림 발송, 열람 기록 |

### Phase 6: 연동 + 마무리 (예상 1주)

| 작업 | 상세 내용 |
|------|-----------|
| VocaBox 연동 | API 연동 설계, 학생 매칭, 점수 동기화 |
| 반응형 UI | 모바일/태블릿 대응 |
| UX 보완 | 에러 핸들링, 로딩 스피너, 빈 상태 화면 |
| 배포 | Vercel 배포, 도메인 연결 |
| 테스트 | 테스트 데이터로 전체 플로우 검증 |

**총 예상 기간: 약 8~10주**

---

## 10. 향후 확장 계획

### 10.1 학부모 리포트 기능 (브레인스토밍 5번)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 과목별 성취도 요약 | 전 과목 성적을 한 화면에 요약 | 높음 |
| 월간 리포트 자동 생성 | 매월 자동 생성 + PDF 내보내기 | 높음 |
| 강사 코멘트 입력 | 리포트에 담당 강사 코멘트 첨부 | 중간 |
| 모바일 열람 | 학부모 전용 모바일 뷰 (로그인 필요) | 높음 |

### 10.2 숙제 관리 기능 (브레인스토밍 6번)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 학생 숙제 진척도 | 숙제 완료율 대시보드 | 중간 |
| AI 문제 풀이 | AI 기반 문제 출제 + 자동 채점 | 낮음 |
| 질문함 | 학생 → 강사 질문 게시판 | 중간 |
| 타이머 | 시험/숙제용 타이머 기능 | 낮음 |

### 10.3 AI 모의고사 (브레인스토밍 7번)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| AI 모의고사 생성 | 이번 주 학습 내용 기반 모의고사 자동 생성 | 낮음 |
| 빈출 영단어 시험 | AI 기반 빈출 단어 시험 자동 생성 | 낮음 |
| 태블릿 시험 | 태블릿에서 직접 응시하는 온라인 시험 | 낮음 |

### 10.4 기타 확장

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 학생/학부모 로그인 | 학생/학부모 전용 포털 | 높음 |
| 온라인 시험 | 웹에서 직접 시험 응시 (자동 채점) | 중간 |
| 학원비 관리 | 결제/수납/미납 관리 | 중간 |
| 상담 관리 | 학부모 상담 예약/기록 | 중간 |
| 다국어 지원 | 영어 UI 지원 | 낮음 |

---

## 부록: 브레인스토밍 → 기획서 추적표

모든 브레인스토밍 항목이 기획서에 빠짐없이 반영되었는지 확인하는 추적표.

| 브레인스토밍 항목 | 기획서 섹션 | 반영 여부 |
|------------------|-----------|-----------|
| 1-1. 과목 생성 | 3.2.1 과목 생성 | ✅ |
| 1-2. 교재별 단원/카테고리 | 3.2.2 교재 등록 및 단원 계층 관리 | ✅ |
| 1-3. 평가 항목 생성 | 3.3.1 평가 생성 | ✅ |
| 1-4. 평가 방식 선택 | 3.3.2 평가 방식 선택 | ✅ |
| 1-5. 학생 입력 탭 | 3.4.1 학생 등록 항목 | ✅ |
| 2-1. 시험/과제 등록 | 3.5.1 성적 입력 방식 | ✅ |
| 2-2. 학생별 결과 입력 | 3.5.1 성적 입력 방식 (개별/일괄) | ✅ |
| 2-3. 결시/미제출 상태 | 3.5.3 결시/미제출 상태 관리 | ✅ |
| 3-1. 카테고리별 성취도 그래프 | 3.6.1 카테고리별 성취도 그래프 | ✅ |
| 3-2. 취약 영역 자동 표시 | 3.6.2 취약 영역 자동 표시 | ✅ |
| 3-3. 성장 추이 그래프 | 3.6.3 성장 추이 그래프 | ✅ |
| 3-4. 위험 신호 알림 | 3.6.4 위험 신호 알림 | ✅ |
| 4-1. 출결 관리 | 3.7 출결 관리 | ✅ |
| 4-2. 과제 알림 | 3.8.1~3.8.3 과제 및 알림 자동화 | ✅ |
| 4-3. 리마인드 자동 발송 | 3.8.2 자동 알림 시나리오 | ✅ |
| 4-4. 부모 알림 자동화 | 3.8.4 학부모 알림 자동화 | ✅ |
| 5. 학부모 리포트 | 10.1 학부모 리포트 기능 | ✅ (향후 확장) |
| 6. 숙제 관리 | 10.2 숙제 관리 기능 | ✅ (향후 확장) |
| 7. 주간 모의고사 | 10.3 AI 모의고사 | ✅ (향후 확장) |

---

## 부록: 용어 정의

| 용어 | 설명 |
|------|------|
| 멀티테넌트 (Multi-tenant) | 하나의 시스템으로 여러 학원(고객)이 독립적으로 사용하는 구조 |
| RLS (Row Level Security) | 데이터베이스 행 수준에서 접근 권한을 제어하는 PostgreSQL 기능 |
| SaaS (Software as a Service) | 웹을 통해 소프트웨어를 서비스 형태로 제공하는 모델 |
| ERP (Enterprise Resource Planning) | 기업/기관 자원 관리 시스템 |
| VocaBox | AiVoca 서비스의 제품명. 영어 단어 시험 관리 특화 서비스 |
