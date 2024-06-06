import Cookies from 'js-cookie';
import { decode, JwtPayload } from 'jsonwebtoken';
import { getPeersResponse } from './api';
import { useLocation } from 'react-router-dom';
import _ from 'lodash';

export function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}

export const getDatetime = (time: string) => {
  const date = new Date(time);

  const year = date.getUTCFullYear().toString();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const getPreheatDatetime = (time: string) => {
  const date = new Date(time);

  date.setHours(date.getUTCHours() + 8);

  const year = date.getUTCFullYear().toString();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const getJwtPayload = () => {
  const payload = (decode(Cookies.get('jwt') || 'jwt') as JwtPayload) || null;

  return payload;
};

export const setPageTitle = (title: string) => {
  const pageTitle = title.replace(/\//g, ' ');
  document.title = `Console ${pageTitle}`;
};

export const getExpiredTime = (time: number) => {
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

export const getPaginatedList = (list: any[], currentPage: number, pageSize: number) => {
  const startIndex = (currentPage - 1) * pageSize;
  return list.slice(startIndex, startIndex + pageSize);
};

interface Header {
  key: string;
  label: string;
}

const convertToCSV = (headers: Header[], objArray: getPeersResponse[]) => {
  let title = '';

  const headersMap = headers.reduce((acc, curr) => {
    acc[curr.key] = curr;
    return acc;
  }, {} as Record<string, Header>);

  title += headers.map((h) => h.label).join(',') + '\r\n';

  for (let i = 0; i < objArray.length; i++) {
    let line = '';
    for (let index in headersMap) {
      if (line !== '') line += ',';
      const value = _.get(objArray[i], index);

      if (Array.isArray(value)) {
        line += value.join('|');
      } else if (typeof value === 'undefined') {
        line += '';
      } else if (value === null) {
        line += 'null';
      } else {
        line += value.toString() || '';
      }
    }
    title += line + '\r\n';
  }

  return title;
};

export const exportCSVFile = (headers: Header[], items: getPeersResponse[], fileTitle: string) => {
  const csv = convertToCSV(headers, items);
  const exportedFilenmae = fileTitle + '.csv' || 'export.csv';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', exportedFilenmae);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
