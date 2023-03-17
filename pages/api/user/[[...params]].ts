import { NextApiRequest, NextApiResponse } from 'next';
import { URL } from '../../../services/constans';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { query } = req;
    const result = await fetch(`${URL}api/v1/users/signin`, {
      method: 'POST',
      body: JSON.stringify(query),
    });
    const data = await result.json();
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ error: { fetch } });
  }
}
