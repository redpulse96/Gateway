INSERT INTO api_configurations (`path`, `request_type`, `request_options`, `response_options`, `type`, `status`,  `request`) VALUES
('/azam/users/register', 'object', NULL, NULL, 'incoming', 'active', '`{ "Email": "string", "Password": "string", "Name": "string", "MobileNumber": "string" }`'),
('/azam/users/login', 'object', NULL, NULL, 'incoming', 'active', '`{ "email": "string", "password": "string" }`'),
('/azam/users/logout', 'object', NULL, NULL, 'incoming', 'active', NULL),
('/azam/users/approveRegistration', 'object', NULL, NULL, 'incoming', 'active', NULL),
('/azam/users/rejectRegistration', 'object', NULL, NULL, 'incoming', 'active', NULL),
('/azam/users/fetchUsers', 'object', NULL, NULL, 'incoming', 'active', NULL),
('/azam/users/fetchTransactions', 'object', NULL, NULL, 'incoming', 'active', NULL),
('/azam/users/updateuser', 'object', NULL, NULL, 'incoming', 'active', NULL),
('/azam/users/attachrole', 'object', NULL, NULL, 'incoming', 'active', NULL),
('/azam/users/completeregistration', 'object', NULL, NULL, 'incoming', 'active', NULL),
('/azam/users/fetchuserdetails', 'object', NULL, NULL, 'incoming', 'active', NULL);

INSERT INTO api_configurations (`path`, `request_type`, `request_options`, `response_options`, `type`, `status`,  `request`) VALUES
('/azam/roles/fetchchildroles', 'object', NULL, NULL, 'incoming', 'active', NULL),
('/azam/roles/fetchparentroles', 'object', NULL, NULL, 'incoming', 'active', NULL),
('/azam/roles/createrole', 'object', NULL, NULL, 'incoming', 'active', '`{"RoleName": "string", "SupervisorRoleID": 1, "AccessRights": [1, 2, 3, 4]}`');

INSERT INTO api_configurations (`path`,`request_type`,`request_options`,`response_options`,`type`,`status`, `request`) VALUES
('/azam/transactions/fetchTransactions', 'object', NULL, NULL, 'incoming', 'active', '`{}`');

INSERT INTO api_configurations (`path`,`request_type`,`request_options`,`response_options`,`type`,`status`, `request`) VALUES
('/azam/airtel/fetchTransactions', 'object', NULL, NULL, 'incoming', 'active', '`{}`'),
('/azam/airtel/fetchTransactionsCount', 'object', NULL, NULL, 'incoming', 'active', '`{}`'),
('/azam/halotel/fetchTransactions', 'object', NULL, NULL, 'incoming', 'active', '`{}`'),
('/azam/halotel/fetchTransactionsCount', 'object', NULL, NULL, 'incoming', 'active', '`{}`'),
('/azam/tigo/fetchTransactions', 'object', NULL, NULL, 'incoming', 'active', '`{}`'),
('/azam/tigo/fetchTransactionsCount', 'object', NULL, NULL, 'incoming', 'active', '`{}`'),
('/azam/vodacom/fetchTransactions', 'object', NULL, NULL, 'incoming', 'active', '`{}`'),
('/azam/vodacom/fetchTransactionsCount', 'object', NULL, NULL, 'incoming', 'active', '`{}`'),
('/azam/zantel/fetchTransactions', 'object', NULL, NULL, 'incoming', 'active', '`{}`'),
('/azam/zantel/fetchTransactionsCount', 'object', NULL, NULL, 'incoming', 'active', '`{}`');

INSERT INTO api_configurations (`path`,`request_type`,`request_options`,`response_options`,`type`,`status`, `request`) VALUES
('FetchAirtelTransactions','object','{ "URL": "https://172.16.100.5:4301/azam/airtel/fetchTransactions", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',NULL,'outgoing','active', NULL),
('FetchHalotelTransactions','object','{ "URL": "https://172.16.100.5:4201/azam/halotel/fetchTransactions", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',NULL,'outgoing','active', NULL),
('FetchTigoTransactions','object','{ "URL": "https://172.16.100.5:4101/azam/tigo/fetchTransactions", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',NULL,'outgoing','active', NULL),
('FetchVodacomTransactions','object','{ "URL": "https://172.16.100.5:4000/azam/vodacom/fetchTransactions", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',NULL,'outgoing','active', NULL),
('FetchZantelTransactions','object','{ "URL": "https://172.16.100.5:4401/azam/zantel/fetchTransactions", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',NULL,'outgoing','active', NULL);

INSERT INTO api_configurations (`path`,`request_type`,`request_options`,`response_options`,`type`,`status`, `request`) VALUES
('FetchAirtelTransactionsCount','object','{ "URL": "https://172.16.100.5:4301/azam/airtel/fetchTransactionsCount", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',NULL,'outgoing','active', NULL),
('FetchHalotelTransactionsCount','object','{ "URL": "https://172.16.100.5:4201/azam/halotel/fetchTransactionsCount", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',NULL,'outgoing','active', NULL),
('FetchTigoTransactionsCount','object','{ "URL": "https://172.16.100.5:4101/azam/tigo/fetchTransactionsCount", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',NULL,'outgoing','active', NULL),
('FetchVodacomTransactionsCount','object','{ "URL": "https://172.16.100.5:4000/azam/vodacom/fetchTransactionsCount", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',NULL,'outgoing','active', NULL),
('FetchZantelTransactionsCount','object','{ "URL": "https://172.16.100.5:4401/azam/zantel/fetchTransactionsCount", "METHOD": "POST", "REJECT_UNAUTHORIZED": false }',NULL,'outgoing','active', NULL);

INSERT INTO api_configurations (`path`,`request_type`,`request_options`,`response_options`,`type`,`status`, `request`) VALUES
('/azam/vendortype/fetch', 'object', NULL, NULL, 'incoming', 'active', NULL);

INSERT INTO api_configurations (`path`,`request_type`,`request_options`,`response_options`,`type`,`status`, `request`) VALUES
('/azam/airtel/fetchTransactions', 'object', NULL, NULL, 'incoming', 'active', NULL),
('/azam/halotel/fetchTransactions', 'object', NULL, NULL, 'incoming', 'active', NULL),
('/azam/tigo/fetchTransactions', 'object', NULL, NULL, 'incoming', 'active', NULL),
('/azam/vodacom/fetchTransactions', 'object', NULL, NULL, 'incoming', 'active', NULL),
('/azam/zantel/fetchTransactions', 'object', NULL, NULL, 'incoming', 'active', NULL);

INSERT INTO api_configurations (`path`,`request_type`,`request_options`,`response_options`,`type`,`status`, `request`) VALUES
('/azam/transactions/fetchFilter', 'object', NULL, NULL, 'incoming', 'active', NULL),
('/azam/transactions/fetchtimestampbasedreports', 'object', NULL, NULL, 'incoming', 'active', NULL),
('/azam/transactions/fetchreportscount', 'object', NULL, NULL, 'incoming', 'active', NULL);

INSERT INTO api_configurations (`path`, `request_type`, `request_options`, `response_options`, `type`, `status`,  `request`) VALUES
('/azam/users/forgotpassword', 'object', NULL, NULL, 'incoming', 'active', NULL),
('/azam/users/confirmpassword', 'object', NULL, NULL, 'incoming', 'active', NULL),
('/azam/users/updateuserstatus', 'object', NULL, NULL, 'incoming', 'active', NULL);

INSERT INTO api_configurations (`path`, `request_type`, `request_options`, `response_options`, `type`, `status`,  `request`) VALUES
('/azam/auditlogs/fetchlogs', 'object', NULL, NULL, 'incoming', 'active', NULL);
('/azam/users/createreport', 'object', NULL, NULL, 'incoming', 'active', NULL);
