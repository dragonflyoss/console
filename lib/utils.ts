import Cookies from 'js-cookie';
import { decode, JwtPayload } from 'jsonwebtoken';

export const datetime = (time: string) => {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hr = `${date.getHours()}`.padStart(2, '0');
  const min = `${date.getMinutes()}`.padStart(2, '0');

  return `${year}-${month}-${day}-${hr}:${min}`;
};

export const getJwtPayload = () => {
  const payload = (decode(Cookies.get('jwt') || 'jwt') as JwtPayload) || null;

  return payload;
};
