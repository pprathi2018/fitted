export const clientCookies = {
  set: (name: string, value: string, days: number = 7) => {
    if (typeof document !== 'undefined') {
      const expires = new Date();
      expires.setDate(expires.getDate() + days);
      
      // Set secure flag in production
      const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
      
      document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()}; SameSite=Strict${secure}`;
    }
  },
  
  get: (name: string): string | null => {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';'); // Split by semicolon
      const cookieObject = {};

      for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim(); // Trim whitespace
        let [cookieName, value] = cookie.split('=');

        if (decodeURIComponent(cookieName) === name) {
          return value;
        }
      }
    }
    return null;
  },
  
  remove: (name: string) => {
    if (typeof document !== 'undefined') {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }
};