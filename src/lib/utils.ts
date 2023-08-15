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

export const setPageTitle = (title: string) => {
  const pageTitle = title.replace(/\//g, ' ');
  document.title = `Console ${pageTitle}`;
};

export const getTime = (time: number) => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() + time);
  return weekAgo.toISOString();
};

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatDate = (time: string) => {
  const date = new Date(time);
  const day = dayNames[date.getDay()];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hour = date.getHours();
  return `${day}, ${month} ${date.getDate()} ${year}`;
};
