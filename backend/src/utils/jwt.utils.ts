import jwt from 'jsonwebtoken';

interface TokenPayload {
    id: string;
    role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, {
        expiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
    } as jwt.SignOptions);
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string) as TokenPayload;
};
