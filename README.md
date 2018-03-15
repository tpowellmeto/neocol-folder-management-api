# neocol folder management
folder management rest api challenge.

## implementation
whole system created in node.js (with stubbed file management api `src/main/js/file-management-api.js`).  
unit tests for public methods only.

| http verb | endpoint               | body                         | expected response                                         |
| ----------|------------------------|------------------------------|-----------------------------------------------------------|
| GET       |/folders/`<CLIENT_ID>`  | N/A                          |`200` with `application/json` content                      |
| POST      |/folders/               | { clientId : `<CLIENT_ID>` } |`201` with `application/json` content and `Location` header|


client ids must be provided in one of the two following formats:  
1. SSSSS(YY)  
2. YYYY-SSSSS  
`SSSSS` an integer with 5 or more digits.  
`YY` is a two-digit integer.  
`YYYY` is a four-digit integer where `1900 < i < 2001`.  


### install
`$ npm install`

### test
unit tests: `$ npm run utest`  
integration tests `$ npm run itest`  

all: `$ npm run test`  

### run
`$ npm start`  

app config in `src/main/resources/config.json`  
file management api stubbed at `src/main/js/file-management-api.js`  
