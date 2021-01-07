export const PaymentVendorConstants = {
  checkUserForAzamTVRequest: {
    METHOD: 'POST',
    QS: { WSDL: '' },
    HEADERS: {
      'content-type': 'text/xml',
    },
    REFERENCE_BODY: `<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://tempuri.org/"><Header><ns1:MQUserNameToken><ns1:User_id>AzamPay</ns1:User_id><ns1:Password>AzamPaytest20</ns1:Password><ns1:ExternalPartyName>AzamTV</ns1:ExternalPartyName></ns1:MQUserNameToken></Header><Body><ns1:GetCustomerInfo><ns1:CustomerInfoXML><![CDATA[<REQUESTINFO><KEY_NAMEVALUE><KEY_NAME>SMARTCARD</KEY_NAME><KEY_VALUE>$</KEY_VALUE></KEY_NAMEVALUE></REQUESTINFO>]]></ns1:CustomerInfoXML><ns1:ReferenceNo>%</ns1:ReferenceNo></ns1:GetCustomerInfo></Body></Envelope>`,
  },
  paymentMqServices: {
    METHOD: 'POST',
    QS: { WSDL: '' },
    URL: 'https://testmq.azammedia.com/TestWebServices/Service.asmx',
    HEADERS: {
      'Content-Type': 'text/xml',
    },
    REFERENCE_BODY: `<Envelope xmlns='http://schemas.xmlsoap.org/soap/envelope/' xmlns:ns1='http://tempuri.org/'> <Header><ns1:MQUserNameToken> <ns1:User_id>AzamPay</ns1:User_id> <ns1:Password>AzamPaytest20</ns1:Password><ns1:ExternalPartyName>AzamPay</ns1:ExternalPartyName> </ns1:MQUserNameToken> </Header><Body> <ns1:MakePayment> <ns1:MakePaymentXML><![CDATA[<REQUESTINFO><KEY_NAMEVALUE><KEY_NAME>SMARTCARD</KEY_NAME><KEY_VALUE>smartCardNo</KEY_VALUE></KEY_NAMEVALUE><PAYMENTINFO><AMOUNT>amount</AMOUNT><PAYMODE>paymentMode</PAYMODE><RECEIPTNO>reciptNo</RECEIPTNO><PAYMENTDATE>paymentDate</PAYMENTDATE><OPENITEM>DEFAULT</OPENITEM><REMARKS>remarks</REMARKS></PAYMENTINFO></REQUESTINFO>]]></ns1:MakePaymentXML> <ns1:ReferenceNo>referenceNo</ns1:ReferenceNo> </ns1:MakePayment></Body></Envelope>`,
  },
};
