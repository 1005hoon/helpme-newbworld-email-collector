const fs = require('fs');

const parseToCSV = (emails) => {
    let result = 'email' + '\n';

    emails.forEach((email, index) => {
        result += email + '\n';
    });

    console.log('CSV로 작성을 시작했어요');
    fs.writeFile('뉴비월드이메일.csv', result, (err) => {
        if (err) console.error(err);
        console.log('CSV 생성 완료했어요');
    });
};

module.exports = parseToCSV;
