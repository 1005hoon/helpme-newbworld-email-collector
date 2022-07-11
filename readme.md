# 뉴비월드 크롤러

뉴비월드 카페 가입자 이메을 크롤러입니다.

## 실행방법

```
$ git clone git@github.com:1005hoon/helpme-newbworld-email-collector.git
$ cd helpme-newbworld-email-collector
$ yarn install
```

로 프로젝트 클론 및 설치를 하세요.

이후 `.env` 파일을 생성하여 NAVER_ID와 NAVER_PASSWORD 값을 설정해주세요.

그리고 `yarn start` 커맨드를 입력하여 실행하면 해당 폴더에 `뉴비월드이메일.csv` 라는 파일이 저장됩니다.

## 페이지 수 조정

기본적으로 카페의 전체 글 중 60페이지를 가져오도록 설정되어 있습니다.
만약, 다른 범위의 페이지 수 를 조회하고 싶다면, `app.js` 파일의 112번줄에 있는 `app(60)` 를 희망하는 페이지 수로 수정해주세요.
