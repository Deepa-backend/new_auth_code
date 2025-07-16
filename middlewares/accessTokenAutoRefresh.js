// // middlewares/accessTokenAutoRefresh.js

import { isTokenExpire } from "../utils/isTokenExpired.js";
import { refreshAccessToken } from "../utils/refreshAccessToken.js";

import sendResponse from "../utils/sendResponse.js";
import { setTokensCookies } from "../utils/setTokensCookies.js";

export const accessTokenAutoRefresh = async (req, res, next) => {
    try {
        let accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;
        
        console.log('accessTokenAutoRefresh: received accessToken from cookie:', accessToken);
        console.log('accessTokenAutoRefresh: received refreshToken from cookie:', refreshToken);

        // Check if access token exists and is valid
        if (accessToken && !isTokenExpire(accessToken)) {
            req.headers['authorization'] = `Bearer ${accessToken}`;
            console.log('accessTokenAutoRefresh: using existing valid accessToken');
            return next();
        }

        console.log('accessTokenAutoRefresh: accessToken expired or missing, trying to refresh');
        
        if (!refreshToken) {
            throw new Error("Both access token and refresh token are missing");
        }

        // Refresh the access token
        const result = await refreshAccessToken(req);
        
        if (result.error) {
            throw new Error(result.message || "Failed to refresh token");
        }

        const { newAccessToken, newAccessTokenExp, newRefreshToken, newRefreshTokenExp } = result;

        console.log('accessTokenAutoRefresh: refresh successful, setting new cookies');
        console.log('newAccessToken:', newAccessToken);
        console.log('newRefreshToken:', newRefreshToken);

        // ✅ Use correct variable names here
        setTokensCookies(res, newAccessToken, newRefreshToken, newAccessTokenExp, newRefreshTokenExp);

        req.headers['authorization'] = `Bearer ${newAccessToken}`;

        // Update cookies in request
        req.cookies.accessToken = newAccessToken;
        req.cookies.refreshToken = newRefreshToken;

        next();
    } catch (error) {
        console.log("error in accessTokenAutoRefresh", error);
        sendResponse(res, "Unauthorized, Access token is missing or invalid", 401, false);
    }
};

