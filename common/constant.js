/**
 * author: Sang Do
 * define constants using in this project
 */

var Constant	= {
    SERVER_ERR				: 'SERVER_ERR',
    QUERY_ERR 				: 'QUERY_ERR',
    EMPTY_DATA 				: 'EMPTY_DATA',
    FAILED_CODE				: 'FAILED',
    FAILED_LOG				: 'FAILED_LOG',
    EXISTED				    : 'EXISTED',
    NOT_EXISTED				: 'NOT_EXISTED',
    CONNECTED				: 'CONNECTED',
    CANNOT_CONNECTED		: 'CANNOT_CONNECTED',
    OK_CODE					: 'OK',
    LOGINED					: 'LOGINED',
    MISMATCH_PARAMS			: 'MISMATCH_PARAMS',    //wrong/missing parameters sending to server
    MALFORMED_PARAM         :   'MALFORMED_PARAM',  //param is not correct format
    NOT_FOUND               : 'NOT_FOUND',
    INVALID_PARAM_VALUE     :   'INVALID_PARAM_VALUE',
    TRUE					: true,
    FALSE					: false,
    STR_TRUE				: 'true',
    STR_FALSE				: 'false',
   
    UNDERSCORE: '_',
    COMMA: ',',
    DOT: '.',
    YES_NUMBER_VAL: 1,		//replace for "true" value because number is easier to compare
    STR_ALL: 'all',
    STR_YES: 'yes',
    STR_NO: 'no',
    LINE_FEED_CHAR: '\r\n',
    DEFAULT_PAGE_LENGTH: 50,        //number of items in 1 paging
    
    CAST_ERROR: 'CastError',        //message from query mongodb
    ObjectID: 'ObjectID',
    ObjectId: 'ObjectId'
   
};
//
module.exports = Constant;
