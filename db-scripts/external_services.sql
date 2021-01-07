CREATE TABLE `external_services` (
  `external_service_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `service_name` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `request_type` ENUM('object', 'string', 'form') COLLATE utf8mb4_bin NOT NULL COMMENT 'This is the type of the request for parsing',
  `request_options` text,
  `request` text,
  `status` ENUM('active', 'inactive', 'deleted') COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`external_service_id`)
) ENGINE=InnoDB DEFAULT AUTO_INCREMENT=1 CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO external_services (`service_name`, `request_type`, `request_options`,`request`, `status`, `created_at`, `updated_at`) VALUES
  ('AirtelCallbackApi', 'string',
  '{ "URL": "https://172.27.34.27:10031/?LOGIN=PushAPI&PASSWORD=MPtc1ToayCkCMZZeHUu0snA3a&REQUEST_GATEWAY_CODE=THIRDPARTY&REQUEST_GATEWAY_TYPE=USSD&requestText=", "METHOD": "POST", "HEADERS": { "Content-type": "application/xml" }, "REJECT_UNAUTHORIZED": false, "AGENT_OPTIONS": { "securityOptions": "TLSv1_method", "CERT": "/home/atharv/Airtel_push_api.crt", "KEY": "/home/atharv/Airtel_push_api.key", "PASS_PHRASE": "PUSH_API@123" } }',
  '`<COMMAND><TYPE>PUSHREQ</TYPE><MSISDN>${options.CustomerMsisdn}</MSISDN><MSISDN2>${options.MSISDN2}</MSISDN2><AMOUNT>${options.Amount}</AMOUNT><INTERFACEID>ONLINEPAY_${options.MSISDN2}</INTERFACEID><REFERENCE_NO>${options.ReferenceID}</REFERENCE_NO><EXT_TRID>${options.ExternalReferenceID}</EXT_TRID></COMMAND>`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('AirtelUssdPush', 'string',
  '{ "URL": "https://172.16.100.5:4301/azam/airtel/ussdpush", "METHOD": "POST", "REJECT_UNAUTHORIZED": false, "AGENT_OPTIONS": { "securityOptions": "TLSv1_method", "CERT": "/home/atharv/Airtel_push_api.crt", "KEY": "/home/atharv/Airtel_push_api.key", "PASS_PHRASE": "PUSH_API@123" } }',
  '`{ "PartnerCode": "${options.PartnerCode}", "CustomerMsisdn": "${options.CustomerMsisdn}", "ReferenceMsisdn": "${options.ReferenceMsisdn}", "Amount": "${options.Amount}" }`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('AirtelTransactionErrorResponse', 'string',
  '{ "URL": "http://mq.azammedia.com/mqsapiws/Service.asmx", "METHOD": "POST", "HEADERS": {"Content-type": "text/xml"} }',
  '`<?xml version="1.0" encoding="UTF - 8"?><COMMAND><TYPE>${options?.TYPE ? options.TYPE : "failure"}</TYPE><TXNSTATUS>${options?.TXNSTATUS ? options.TXNSTATUS : 500}</TXNSTATUS><MESSAGE>${options?.MESSAGE ? options.MESSAGE : "Internal server error"}</MESSAGE></COMMAND>`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('AirtelTransactionSuccessResponse', 'string',
  '{ "URL": "http://mq.azammedia.com/mqsapiws/Service.asmx", "METHOD": "POST", "HEADERS": {"Content-type": "text/xml"} }',
   '`<?xml version="1.0" encoding="UTF - 8"?><COMMAND><TYPE>${options.TYPE ? options.TYPE : "failure"}</TYPE><TXNSTATUS>${options.TXNSTATUS ? options.TXNSTATUS : 500}</TXNSTATUS><MESSAGE>${options.MESSAGE ? options.MESSAGE : "Internal server error"}</MESSAGE></COMMAND>`',
   'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('InfobipPath', 'object',
  '{ "URL": "http://pz6pm.api.infobip.com/sms/1/text/single","HEADERS": { "Content-Type": "application/json", "Authorization": "App 78a500a60f2f605e30f7e4f4c6027823-70a938d2-a288-4172-ba79-53a8995e05f4" }, "AUTH_TOKEN": "App 78a500a60f2f605e30f7e4f4c6027823-70a938d2-a288-4172-ba79-53a8995e05f4","METHOD": "POST","CONTENT_TYPE": "application/json","JSON": true }',
  '`{"from": "AZMA GATEWAY", "to": ${options.MobileNumber} || "+917760225405", "text": ${options.SmsText} || "Is a dummy otpcode"}`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('CheckUserForAzamTVRequest', 'string',
   '{"URL": "https://testmq.azammedia.com/TestWebServices/Service.asmx","METHOD": "POST","HEADERS": {"Content-type": "text/xml"},"QS": {"WSDL": ""}, "REJECT_UNAUTHORIZED": false, "INSECURE": false}',
   '`<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://tempuri.org/"><Header><ns1:MQUserNameToken><ns1:User_id>AzamPay</ns1:User_id><ns1:Password>AzamPaytest20</ns1:Password><ns1:ExternalPartyName>AzamPay</ns1:ExternalPartyName></ns1:MQUserNameToken></Header><Body><ns1:GetCustomerInfo><ns1:CustomerInfoXML><![CDATA[<REQUESTINFO><KEY_NAMEVALUE><KEY_NAME>SMARTCARD</KEY_NAME><KEY_VALUE>${options.referenceNumber.senderMsisdn}</KEY_VALUE></KEY_NAMEVALUE></REQUESTINFO>]]></ns1:CustomerInfoXML><ns1:ReferenceNo>${options.referenceNo}</ns1:ReferenceNo></ns1:GetCustomerInfo></Body></Envelope>`',
   'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('PaymentMqService', 'string',
   '{ "URL": "https://testmq.azammedia.com/TestWebServices/Service.asmx", "METHOD": "POST", "HEADERS": { "Content-type": "text/xml" }, "QS": { "WSDL": "" }, "REJECT_UNAUTHORIZED": false }',
   '`<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://tempuri.org/"> <Header><ns1:MQUserNameToken> <ns1:User_id>AzamPay</ns1:User_id> <ns1:Password>AzamPaytest20</ns1:Password><ns1:ExternalPartyName>AzamPay</ns1:ExternalPartyName> </ns1:MQUserNameToken> </Header><Body> <ns1:MakePayment> <ns1:MakePaymentXML><![CDATA[<REQUESTINFO><KEY_NAMEVALUE><KEY_NAME>SMARTCARD</KEY_NAME><KEY_VALUE>${options.smartCardNo}</KEY_VALUE></KEY_NAMEVALUE><PAYMENTINFO><AMOUNT>${options.amount}</AMOUNT><PAYMODE>CA</PAYMODE><RECEIPTNO>${options.reciptNo}</RECEIPTNO><PAYMENTDATE>${options.paymentDate}</PAYMENTDATE><OPENITEM>DEFAULT</OPENITEM><REMARKS>${options.remarks}</REMARKS></PAYMENTINFO></REQUESTINFO>]]></ns1:MakePaymentXML> <ns1:ReferenceNo>${options.referenceNo}</ns1:ReferenceNo> </ns1:MakePayment></Body></Envelope>`',
   'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('ValidateTigoToken', 'form',
   '{ "URL": "http://accessgwtest.tigo.co.tz:8080/AZAMPAY2DM-GetToken", "METHOD": "POST", "HEADERS": { "Content-type": "application/x-www-form-urlencoded" } }',
   '`{"username": "${options.Username}", "password": "${options.Password}", "grant_type": "password"}`',
   'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('ValidateTigoTokenInternal', 'object',
   '{ "URL": "https://172.16.100.5:4101/tigo/ValidateToken", "REJECT_UNAUTHORIZED": false, "METHOD": "POST", "HEADERS": { "Content-type": "application/json" } }',
   '`{"Username": "${options.Username}", "Password": "${options.Password}"}`',
   'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('InitiateTigoTransaction', 'object',
  '{ "URL": "http://accessgwtest.tigo.co.tz:8080/AZAMPAY2DM-PushBillpay", "METHOD": "POST", "HEADERS": { "Content-type": "application/json" } }',
  '`{"CustomerMSISDN": "${options.CustomerMSISDN}", "BillerMSISDN": "${options.BillerMSISDN}", "Amount": "${options.Amount}", "Remarks": "${options.Remarks}", "ReferenceID": "${options.ReferenceID}"}`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('InitiateTigoTransactionInternal', 'object',
  '{ "URL": "https://172.16.100.5:4101/tigo/InitiateTransaction", "REJECT_UNAUTHORIZED": false, "METHOD": "POST" }',
  '`{ "PartnerCode": "${options.PartnerCode}", "CustomerMSISDN": "${options.CustomerMSISDN}", "ReferenceMSISDN": "${options.ReferenceMSISDN}", "Amount": "${options.Amount}" }`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('QueryTigoTransaction', 'object',
  '{ "URL": "https://10.222.130.104:9101/API/Heartbeat/Heartbeat", "METHOD": "POST", "HEADERS": { "Content-type": "application/json" } }',
  '`{"ReferenceID": "${options.ReferenceID}"}`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('PayTigoBillInSync', 'string',
  '{ "URL": "https://10.222.130.104:9101/API/Heartbeat/Heartbeat", "METHOD": "POST", "HEADERS": { "Content-type": "application/json" } }',
  '`<?xml version="1.0"?><COMMAND><TYPE>string</TYPE><TXNID>string</TXNID><MSISDN>string</MSISDN><AMOUNT>string</AMOUNT><COMPANYNAME>string</COMPANYNAME><CUSTOMERREFERENCEID>string</CUSTOMERREFERENCEID></COMMAND>`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('PayHalotelInstance', 'string',
  '{ "URL": "http://10.225.199.107:8018/ServiceAPI", "METHOD": "POST", "HEADERS": { "Content-type": "text/xml", "Accept": "*/*", "Accept-Encoding": "gzip, deflate" } }',
  '`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.merchant.vmoney.viettel.com/"> <soapenv:Header /> <soapenv:Body> <ws:HaloPesaServiceAPI> <request> <requestid>${options.requestid}</requestid> <username>${options.username}</username> <password>${options.password}</password> <request_time>${options.request_time}</request_time> <amount>${options.amount}</amount> <sender_msisdn>${options.senderMsisdn}</sender_msisdn> <beneficiary_accountid>${options.beneficiary_accountid}</beneficiary_accountid> <referenceid>${options.referenceid}</referenceid> <business_no>${options.business_no}</business_no> <function_code>${options.function_code}</function_code> <addition_data /> <check_sum>${options.check_sum}</check_sum> </request> </ws:HaloPesaServiceAPI> </soapenv:Body></soapenv:Envelope>`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('HalotelUssdPush', 'object',
  '{ "URL": "https://172.16.111.5:4201/azam/halotel/ussdpush/initiatepayment", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',
  '`{ "PartnerCode": "${options.PartnerCode}", "SenderMsisdn": "${options.SenderMsisdn}", "ReferenceMsisdn": "${options.ReferenceMsisdn}", "Amount": "${options.Amount}" }`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('VodacomResponseIntimation', 'string',
  '{ "URL": "https://41.217.203.61:30009/iPG/c2b/multione", "METHOD": "POST", "QS": { "WSDL": "" }, "HEADERS": { "Accept-Encoding": "gzip, deflate", "Accept": "*/*", "Content-type": "text/xml" } }',
  '`<mpesaBroker xmlns="http://inforwise.co.tz/broker/" version="2.0"><request><serviceProvider><spId>${options.spId}</spId><spPassword>${options.spPassword}</spPassword><timestamp>${options.timestamp}</timestamp></serviceProvider><transaction><resultType>${options.resultType}</resultType><resultCode>${options.resultCode}</resultCode><resultDesc>${options.resultDesc}</resultDesc><serviceReceipt>${options.serviceReceipt}</serviceReceipt><serviceDate>${options.serviceDate}</serviceDate><originatorConversationID>${options.originatorConversationID}</originatorConversationID><conversationID>${options.conversationID}</conversationID><transactionID>${options.transactionID}</transactionID><initiator>${options.initiator}</initiator><initiatorPassword>${options.initiatorPassword}</initiatorPassword></transaction></request></mpesaBroker>`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('ZantelUssdPushService', 'string',
  '{ "URL": "https://41.204.152.247:443/3PPMRORUSSDPushService?wsdl", "QS": { "WSDL": "" }, "METHOD": "POST", "HEADERS": { "Content-type": "text/xml", "Accept": "*/*", "Accept-Encoding": "gzip, deflate" }, "REJECT_UNAUTHORIZED": false }',
  '`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:api="http://api.push.mror.zantel.tz.psi.com/"> <soapenv:Header /> <soapenv:Body> <api:PushRequest> <Credential> <Username>${options.Username}</Username> <Password>${options.Password}</Password> </Credential> <msisdn>${options.Msisdn}</msisdn> <referencedata1>${options.ReferenceData1}</referencedata1> <referencedata2>${options.ReferenceData2}</referencedata2> <amount>${options.Amount}</amount> </api:PushRequest> </soapenv:Body> </soapenv:Envelope>`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('ZantelQueryTransaction', 'string',
  '{ "URL": "https:// 41.204.152.247:443/3PPMRORUSSDPushCheckTxn", "QS": { "WSDL": "" }, "METHOD": "POST", "HEADERS": { "Content-type": "text/xml", "Accept": "*/*", "Accept-Encoding": "gzip, deflate" } }',
  '`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:api="http://api.push.mror.zantel.tz.psi.com/"> <soapenv:Header /> <soapenv:Body> <api:TransactionCheckRequest> <Credential> <Username>${options.Username}</Username> <Password>${options.Password}</Password> </Credential> <PushReferenceId>${options.PushReferenceId}</PushReferenceId> </api:TransactionCheckRequest> </soapenv:Body> </soapenv:Envelope>`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('CrdbMerchantVerification', 'object',
  '{ "URL": "http://192.168.151.71:807/merchantuat/api/service/mip", "METHOD": "POST", "HEADERS": { "Content-type": "application/json", "Accept": "*/*", "Accept-Encoding": "gzip, deflate" }, "JSON": true }',
  '`{ "code": "${options.code}", "customerName": "${options.customerName}", "customerAccount": "${options.customerAccount}", "customerMobile": "${options.customerMobile}", "otp": "${options.otp}", "merchantID": "${options.merchantID}", "token": "${options.token}", "checksum": "${options.checksum}" }`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('CrdbTransactionInitiation', 'object',
  '{ "URL": "http://192.168.151.71:807/merchantuat/api/service/mip", "METHOD": "POST", "HEADERS": { "Content-type": "application/json", "Accept": "*/*", "Accept-Encoding": "gzip, deflate" }, "JSON": true }',
  '`{ "code": "${options.code}", "paymentType": "${options.paymentType}", "paymentDesc": "${options.paymentDesc}", "merchantID": "${options.merchantID}", "customerToken": "${options.customerToken}", "amount": "${options.amount}", "currency": "${options.currency}", "paymentReference": "${options.paymentReference}", "token": "${options.token}", "checksum": "${options.checksum}" }`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('FetchAirtelTransactions', 'object', '{ "URL": "https://172.16.100.5:4301/azam/airtel/fetchTransactions", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }', '{}', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('FetchHalotelTransactions', 'object',
  '{ "URL": "https://172.16.100.5:4201/azam/halotel/fetchTransactions", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',
  '{}', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('FetchTigoTransactions', 'object',
  '{ "URL": "https://172.16.100.5:4201/azam/tigo/fetchTransactions", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',
  '{}', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('FetchVodacomTransactions', 'object',
  '{ "URL": "https://172.16.100.5:4201/azam/vodacom/fetchTransactions", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',
  '{}', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('FetchZantelTransactions', 'object',
  '{ "URL": "https://172.16.100.5:4201/azam/zantel/fetchTransactions", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',
  '{}', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('ConfirmConnectedAppPayment', 'object',
  '{ "URL": "https://172.16.111.5:8080/azam/confirm/payment", "METHOD": "POST", "JSON": true, "REJECT_UNAUTHORIZED": false }',
  '`{ "apiPath": "${options.apiPath}", "transactionstatus": "${options.transactionstatus}", "message": "${options.message}", "operator": "${options.operator}", "reference": "${options.reference}", "utilityref": "${options.utilityref}", "amount": "${options.amount}", "transid": "${options.transid}", "msisdn": "${options.msisdn}" }`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('ConfirmSarafuPayment', 'object',
  '{ "URL": "http://3.120.252.221:4000/confirmPayment", "METHOD": "POST", "JSON": true }',
  '`{ "transactionstatus": "${options.TransactionStatus}", "message": "${options.Message}", "operator": "${options.Operator}", "reference": "${options.ReferenceID}", "utilityref": "${options.UtilityReference}", "amount": "${options.Amount}", "transid": "${options.TansactionID}", "msisdn": "${options.Msisdn}" }`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('PayToAzamMediaPayment', 'object',
  '{ "URL": "https://172.16.100.5:4300/azam/confirm/payment", "METHOD": "POST", "JSON": true, "REJECT_UNAUTHORIZED": false }',
  '`{ "apiPath": "${options.apiPath}", "transactionstatus": "${options.transactionstatus}", "message": "${options.message}", "operator": "${options.operator}", "reference": "${options.reference}", "utilityref": "${options.utilityref}", "amount": "${options.amount}", "transid": "${options.transid}", "msisdn": "${options.msisdn}" }`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('ConfirmAzamMediaPayment', 'object',
  '{ "URL": "http://34.245.88.152:3030/api/wallet-transaction/v2/callback", "METHOD": "POST", "JSON": true }',
  '`{ "transactionstatus": "${options.TransactionStatus}", "message": "${options.Message}", "operator": "${options.Operator}", "reference": "${options.ReferenceID}", "utilityref": "${options.UtilityReference}", "amount": "${options.Amount}", "transid": "${options.TansactionID}", "msisdn": "${options.Msisdn}" }`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('FetchAirtelTransactionsCount', 'object',
  '{ "URL": "https://172.16.100.5:4301/azam/airtel/fetchTransactionsCount", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',
  '{}',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('FetchHalotelTransactionsCount', 'object',
  '{ "URL": "https://172.16.100.5:4301/azam/halotel/fetchTransactionsCount", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',
  '{}',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('FetchTigoTransactionsCount', 'object',
  '{ "URL": "https://172.16.100.5:4301/azam/tigo/fetchTransactionsCount", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',
  '{}',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('FetchVodacomTransactionsCount', 'object',
  '{ "URL": "https://172.16.100.5:4301/azam/vodacom/fetchTransactionsCount", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',
  '{}',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('FetchZantelTransactionsCount', 'object',
  '{ "URL": "https://172.16.100.5:4301/azam/zantel/fetchTransactionsCount", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',
  '{}',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('NmbAccountInquiry', 'object',
  '{ "URL": "http://196.216.218.35/AzamAdapter/AzamWS", "METHOD": "POST", "HEADERS": { "Content-type": "application/json" } }',
  '`{ "username": "${options.username}", "password": "${options.password}", "request": { "operation": "${options.operation}", "accountnumber": "${options.accountnumber}", "azamtransactionref": "${options.azamtransactionref}" } }`',
  'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('NmbMerchantRegistration', 'object',
  '`{ "username": "${options.username}", "password": "${options.password}", "request": { "operation": "${options.request.operation}", "accountnumber": "${options.request.accountnumber}", "mechantname": "${options.request.mechantname}", "azamtime": "${options.request.azamtime}", } }`',
  '{ "URL": "http://196.216.218.35/AzamAdapter/AzamWS", "METHOD": "POST", "HEADERS": { "Content-type": "application/json" } }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('NmbMerchantDeregistration', 'object',
   '`{ "username": "${options.username}", "password": "${options.password}", "request": { "operation": "${options.request.operation}", "drtoken": "${options.request.drtoken}", "azamtime": "${options.request.azamtime}" } }`',
   '{ "URL": "http://196.216.218.35/AzamAdapter/AzamWS", "METHOD": "POST", "HEADERS": { "Content-type": "application/json" } }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('NmbTransactionInitiation', 'object',
   '`{ "username": "${options.username}", "password": "${options.password}", "request": { "operation": "${options.request.operation}", "merchantmobile": "${options.request.merchantmobile}", "drtoken": "${options.request.drtoken}", "amount": "${options.request.amount}", "businesscode": "${options.request.businesscode}", "azamtransactionref": "${options.request.azamtransactionref}" } }`',
   '{ "URL": "http://196.216.218.35/AzamAdapter/AzamWS", "METHOD": "POST", "HEADERS": { "Content-type": "application/json" } }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO external_services (`service_name`, `request_type`, `request_options`,`request`, `status`, `created_at`, `updated_at`) VALUES
('NmbMerchantAuthorization', 'object',
   '`{ "username": "${options.username}", "password": "${options.password}", "request": { "operation": "${options.request.operation}", "drtoken": "${options.request.drtoken}", "otp": "${options.request.otp}", "azamtransactionref": "${options.request.azamtransactionref}" } }`',
   '{ "URL": "http://196.216.218.35/AzamAdapter/AzamWS", "METHOD": "POST", "HEADERS": { "Content-type": "application/json" } }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO external_services (`service_name`, `request_type`, `request_options`,`request`, `status`, `created_at`, `updated_at`) VALUES
  ('ValidateDtbAccount', 'object',
  '{}',
   '{}', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('ValidateDtbAuthCode', 'object',
   '{}',
    '{}', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('PostDtbTransaction', 'object', '{}', '{}', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO external_services (`service_name`, `request_type`, `request_options`,`request`, `status`, `created_at`, `updated_at`) VALUES
  ('NmbMerchantRegistrationInternal', 'object',
   '{ "URL": "https://localhost:5000/azam/nmb/registermerchant", "METHOD": "POST", "REJECT_UNAUTHORIZED": false, "HEADERS": { "Content-type": "application/json" } }',
    '`{ "merchantDetails": { "PartnerCode": "${options.merchantDetails.PartnerCode}", "MerchantAccountNumber": "${options.merchantDetails.MerchantAccountNumber}", "MerchantName": "${options.merchantDetails.MerchantName}", "CountryCode": "${options.merchantDetails.CountryCode}" } }`', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('NmbMerchantAuthInternal', 'object',
   '{ "URL": "https://localhost:5000/azam/nmb/authorizemerchant", "METHOD": "POST", "REJECT_UNAUTHORIZED": false, "HEADERS": { "Content-type": "application/json" } }',
    '`{ "transactionDetails": { "PartnerCode": "${options.transactionDetails.PartnerCode}", "MerchantReferenceID": "${options.transactionDetails.MerchantReferenceID}", "Otp": "${options.transactionDetails.Otp}", "CountryCode": "${options.transactionDetails.CountryCode}" } }`', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('NmbInitiateTransactionInternal', 'object',
  '{ "URL": "https://localhost:5000/azam/nmb/initiatetransaction", "METHOD": "POST", "REJECT_UNAUTHORIZED": false, "HEADERS": { "Content-type": "application/json" } }',
   '`{ "transactionDetails": { "PartnerCode": "${options.transactionDetails.PartnerCode}", "MerchantReferenceID": "${options.transactionDetails.MerchantReferenceID}", "MobileNumber": "${options.transactionDetails.MobileNumber}", "Amount": "${options.transactionDetails.Amount}", "CountryCode": "${options.transactionDetails.CountryCode}" } }`', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO external_services (`service_name`, `request_type`, `request_options`,`request`, `status`, `created_at`, `updated_at`) VALUES
  ('CrdbMerchantVerificationInternal', 'object',
   '{ "URL": "https://localhost:5001/azam/crdb/verifymerchant", "METHOD": "POST", "REJECT_UNAUTHORIZED": false, "HEADERS": { "Content-type": "application/json" } }',
    '`{ "MerchantDetails": { "MerchantAccountNumber": "${options.MerchantDetails.MerchantAccountNumber}", "PartnerCode": "${options.MerchantDetails.PartnerCode}", "MerchantName": "${options.MerchantDetails.MerchantName}", "MerchantMobileNumber": "${options.MerchantDetails.MerchantMobileNumber}", "Otp": "${options.MerchantDetails.Otp}" } }`', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('CrdbTransactionInitiationInternal', 'object',
   '{ "URL": "https://localhost:5001/azam/crdb/initiatetransaction", "METHOD": "POST", "REJECT_UNAUTHORIZED": false, "HEADERS": { "Content-type": "application/json" } }',
    '{ "TransactionDetails": { "MerchantReferenceID": "${options.MerchantDetails.MerchantReferenceID}", "PartnerCode": "${options.MerchantDetails.PartnerCode}", "CurrencyCode": "${options.MerchantDetails.CurrencyCode}", "Amount": "${options.MerchantDetails.Amount}" } }`', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
