import { NextApiRequest, NextApiResponse } from 'next';
import { getSchedulerClusters } from 'lib/api';

type Data = {
  data: any;
};
export default async function handler(_req: NextApiRequest, res: NextApiResponse<Data>) {
  const raply = await getSchedulerClusters();
  res.status(200).json({
    data: raply,
  });
}
