import Cookies from 'js-cookie';
import { decode } from 'jsonwebtoken';

export const datetime = (time: string) => {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours
    .toString()
    .padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const getUserID = () => {
  const accountInformation: any = decode(Cookies.get('jwt') || 'jwt');

  if (accountInformation) {
    return accountInformation?.id;
  }
};
