const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
const parseToCSV = require("./array_to_csv");

dotenv.config();

/** 네이버 아이디와 비밀번호 */
const { NAVER_ID, NAVER_PASSWORD } = process.env;

/** 로그인 주소 */
const LOGIN_URL = "https://nid.naver.com/nidlogin.login";

/** 멤버관리 페이지 주소 */
const MEMBER_MANAGE_URL = "https://cafe.naver.com/ManageWholeMember.nhn?clubid=30130324";

/** 크롤링 실행할 함수 */
const app = async (pageNumber = 1) => {
	/** 웹 브라우저 열기 */
	const browser = await puppeteer.launch({ headless: false });

	/** 브라우저에 새로운 탭 열기 */
	const page = await browser.newPage();
	page.setViewport({ width: 1080, height: 1400 });
	/** 로그인 페이지로 이동 */
	await page.goto(LOGIN_URL);

	/** 페이지 열리면, 아이디 비밀번호 칸 찾아서 값 입력 */
	await page.evaluate(
		(id, pw) => {
			document.querySelector("#id").value = id;
			document.querySelector("#pw").value = pw;
		},
		NAVER_ID,
		NAVER_PASSWORD
	);

	/** 로그인 버튼 클릭 */
	await page.click(".btn_login");

	/** 로그인 하고나서 네이버 메인페이지로 이동할때까지 대기 */
	await page.waitForNavigation();

	/** 카페 멤버관리 페이지로 이동 */
	await page.goto(MEMBER_MANAGE_URL, { waitUntil: "load" });

	/** 이메일 결과물을 담아둘 박스 */
	const results = [];

	for (let i = 0; i < pageNumber; i++) {
		/** 멤버관리 페이지에서 사용자 정보를 받아올때까지 대기 */
		await page.waitForSelector(".nick");

		/** 페이지가 다 로딩 된다면 */
		const data = await page.evaluate(async () => {
			/** 페이지에 있는 이메일들을 담아둘 박스 */
			const emails = [];

			/** 이 페이지에 있는 닉네임 리스트를 우선 다 선택 */
			const userList = document.querySelectorAll(".nick");

			/** 선택된 리스트에서 각 요소별로 순회를 하면서  */
			userList.forEach((list) => {
				/** 이메일 값을 꺼내 @naver.com을 붙여주고  */
				const email = list.textContent.split("(")[1].replace(/[{()}]/g, "") + "@naver.com";

				/** 위에 만들었던 emails 박스에 이메일들 추가 */
				emails.push(email);
			});

			/** 다음 페이지 번호가 몇번인지를 기록하기 위한 변수  */
			let nextPage = 0;

			/** 아래에 페이지 변경 링크를 선택 */
			const links = document.querySelector("#paginate").children;

			/** 그리고 현재 페이지를 찾을때까지 루프 */
			let isCurrentPage = false;
			while (!isCurrentPage) {
				/** 만약 링크가 'on' 이라는 클래스 이름을 갖고 있으면, 현재 페이지임! */
				if (links.item(nextPage).classList.contains("on")) {
					/** 따라서 현재 페이지를 찾았으니까 루프를 끝내주도록 */
					isCurrentPage = true;
				}

				/** 그리고 현재 페이지 + 1이 우리가 가져와야 할 다음 페이지이니, nextPage에 1 더해주기 */
				nextPage++;
			}

			/** 그리고 다음 페이지 버튼으로 클릭! */
			const nextPageBtn = links.item(nextPage % 12 === 0 ? 1 : nextPage % 12);

			nextPageBtn.click();

			/** 이 작업이 끝나면 이메일 결과물 반환! */
			return emails;
		});

		/** 다음페이지로 이동한 뒤 로딩이 될대까지 대기! */
		await page.waitForTimeout(800);

		/** 위의 작업으로 반환된 이메일 목록은 data에 있음! 그래서 data에 기록된 이메일들을 results에 담아주기 */
		data.map((email) => results.push(email));
	}

	console.log(`${results.length} 개의 이메일을 가져왔어요 `);

	parseToCSV(results);

	console.log("뉴비월드 가입자 이메일 가져오기 끝");
};

app(60).catch((e) => console.error(e));
