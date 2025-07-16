// const sendResponse = (res, message, statusCode, success, data = null) => {
//     return res.status(statusCode).json({
//         success,
//         error: !success,
//         message,
//         data,
//     });
// };

// export  default sendResponse;

// utils/sendResponse.js
const sendResponse = (res, message, statusCode = 200, success = true, data = null) => {
  return res.status(statusCode).json({
    success,
    error: !success,
    message,
    data,
  });
};

export default sendResponse;
