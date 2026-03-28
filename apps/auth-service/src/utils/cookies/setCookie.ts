
export const setCookie = (res: any, name: string, value: string) => {
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie(name, value, cookieOptions);
}