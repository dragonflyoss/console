import { NextApiRequest, NextApiResponse } from 'next';
import { getClusters } from 'lib/api';

type Data = {
  data: any;
};
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const  {slug } = req.query;
  const raply = await getClusters(slug);
  res.status(200).json({
    data: raply,
  });
}
