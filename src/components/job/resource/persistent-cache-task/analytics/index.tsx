import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Chart,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { getPersistentCacheTasksResponse } from '../../../../../lib/api';
import { useEffect, useState } from 'react';
import { Box, Skeleton, Typography, Tooltip as MuiTooltip, Divider, LinearProgress, useTheme } from '@mui/material';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

import styles from './index.module.css';
import Card from '../../../../card';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);
Chart.defaults.font.family = 'mabry-light';

interface InformationProps {
  persistentCacheTasks: getPersistentCacheTasksResponse[];
  isLoading: boolean;
}

export default function Analytics({ persistentCacheTasks, isLoading }: InformationProps) {
  const [application, setApplication] = useState([{ name: '', count: 0 }]);
  const [tag, setTag] = useState([{ name: '', count: 0 }]);
  const [applicationCount, setApplicationCount] = useState<number>(0);
  const [tagCount, setTagCount] = useState<number>(0);
  const [applicationSuccess, setApplicationSuccess] = useState<number>(0);
  const [tagSuccess, setTagSuccess] = useState<number>(0);

  const theme = useTheme();

  useEffect(() => {
    const applicationCount = new Set(persistentCacheTasks.map((item) => item.application)).size;
    const tagCount = new Set(persistentCacheTasks.map((item) => item.tag)).size;

    setApplicationCount(applicationCount);
    setTagCount(tagCount);

    const application = Object.entries(
      persistentCacheTasks.reduce<{ [key: string]: number }>((acc, curr) => {
        const { application } = curr;
        if (application === '') {
          return acc;
        }

        if (acc[application]) {
          acc[application] += 1;
        } else {
          acc[application] = 1;
        }
        return acc;
      }, {}),
    ).map(([name, count]) => ({ name, count }));

    const applicationSuccess = (application.length / persistentCacheTasks.length) * 100;

    setApplicationSuccess(applicationSuccess);
    setApplication(application);

    const tag = Object.entries(
      persistentCacheTasks.reduce<{ [key: string]: number }>((acc, curr) => {
        const { tag } = curr;

        if (tag === '') {
          return acc;
        }

        if (acc[tag]) {
          acc[tag] += 1;
        } else {
          acc[tag] = 1;
        }
        return acc;
      }, {}),
    ).map(([name, count]) => ({ name, count }));

    const tagSuccess = (tag.length / persistentCacheTasks.length) * 100;

    setTagSuccess(tagSuccess);
    setTag(tag);
  }, [persistentCacheTasks]);

  const barOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0)' },
      },
    },
  };

  const doughnutOptions = {
    plugins: {
      legend: {
        position: 'bottom' as 'bottom',
      },
    },
  };

  const applicationBar = {
    labels: application.map((item) => item.name),
    datasets: [
      {
        data: application.map((item) => item.count),
        backgroundColor: theme.palette.mode === 'dark' ? '#01A76F' : 'rgb(31, 125, 83)',
        borderRadius: 5,
        barPercentage: 0.6,
      },
    ],
  };

  const doughnutBackgroundColor = [
    'rgb(31, 125, 83)',
    'rgba(31, 125, 83,0.8)',
    'rgba(31, 125, 83,0.6)',
    'rgba(31, 125, 83,0.4)',
    'rgba(31, 125, 83,0.2)',
  ];

  const darkDoughnutBackgroundColor = ['#01A76F', '#5BE49B', '#C8FAD6', '#004B50', '#007868'];

  const applicationDoughnut = {
    labels: application.map((item) => item.name),
    datasets: [
      {
        label: 'Application',
        data: application.map((item) => item.count),
        backgroundColor: theme.palette.mode === 'dark' ? darkDoughnutBackgroundColor : doughnutBackgroundColor,
        borderWidth: 0,
        borderColor: 'rgba(255, 255, 255, 0.6)',
      },
    ],
  };

  const tagBar = {
    labels: tag.map((item) => item.name),
    datasets: [
      {
        data: tag.map((item) => item.count),
        backgroundColor: theme.palette.mode === 'dark' ? '#01A76F' : 'rgb(31, 125, 83)',
        borderRadius: 5,
        barPercentage: 0.6,
      },
    ],
  };

  const tagDoughnut = {
    labels: tag.map((item) => item.name),
    datasets: [
      {
        label: 'Tag',
        data: tag.map((item) => item.count),
        backgroundColor: theme.palette.mode === 'dark' ? darkDoughnutBackgroundColor : doughnutBackgroundColor,
        borderWidth: 0,
        borderColor: 'rgba(255, 255, 255, 0.6)',
      },
    ],
  };

  return (
    <div>
      <Box className={styles.navigationContainer}>
        <Card className={styles.navigationWrapper}>
          <Box>
            <Typography variant="subtitle2" fontFamily="mabry-bold" color="var(--palette-table-title-text-color)">
              Total
            </Typography>
            {isLoading ? (
              <Box p="0.4rem 0">
                <Skeleton height={40} data-testid="isloading" width="2rem" />
              </Box>
            ) : (
              <Typography id="total" variant="h5" p="0.5rem 0">
                {persistentCacheTasks?.length}
              </Typography>
            )}
            <Box className={styles.navigationCount}>
              {/* <span className={styles.navigationCountIcon}>
                <Count />
              </span> */}
              <Typography variant="body2" color="var(--palette-table-title-text-color)">
                number of persistent cache task
              </Typography>
            </Box>
          </Box>
          <Box className={styles.navigation} />
          {/* <Total className={styles.navigationIcon} /> */}
        </Card>
        <Card className={styles.navigationWrapper}>
          <Box className={styles.navigationContent}>
            <Box>
              <Typography variant="subtitle2" fontFamily="mabry-bold" color="var(--palette-table-title-text-color)">
                Application
              </Typography>
              {isLoading ? (
                <Box p="0.4rem 0">
                  <Skeleton height={40} data-testid="isloading" width="2rem" />
                </Box>
              ) : (
                <Typography id="active" variant="h5" p="0.5rem 0">
                  {applicationCount}
                </Typography>
              )}
              <Box className={styles.navigationCount}>
                {/* <span className={styles.navigationCountIcon}>
                  <Count />
                </span> */}
                <Typography variant="body2" color="var(--palette-table-title-text-color)">
                  number of application
                </Typography>
              </Box>
            </Box>
            <Box className={styles.navigation} />
            {/* <Active className={styles.navigationIcon} /> */}
          </Box>
        </Card>
        <Card className={styles.navigationWrapper}>
          <Box className={styles.navigationContent}>
            <Box>
              <Typography variant="subtitle2" fontFamily="mabry-bold" color="var(--palette-table-title-text-color)">
                Tag
              </Typography>
              {isLoading ? (
                <Box p="0.4rem 0">
                  <Skeleton height={40} data-testid="isloading" width="2rem" />
                </Box>
              ) : (
                <Typography id="inactive" variant="h5" p="0.5rem 0">
                  {tagCount}
                </Typography>
              )}
              <Box className={styles.navigationCount}>
                {/* <span className={styles.navigationCountIcon}>
                  <Count />
                </span> */}
                <Typography variant="body2" color="var(--palette-table-title-text-color)">
                  number of tag
                </Typography>
              </Box>
            </Box>
            <Box className={styles.navigation} />
            {/* <Inactive className={styles.navigationIcon} /> */}
          </Box>
        </Card>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <Box className={styles.visualizationWrapper}>
          <Box className={styles.dashboard}>
            <Card className={styles.barContainer}>
              <Box className={styles.barTitle}>
                <Box>
                  <Typography variant="subtitle1" component="span" sx={{ fontFamily: 'mabry-bold' }}>
                    Peer Statistics&nbsp;
                  </Typography>
                  <Typography variant="subtitle1" component="span" sx={{ fontFamily: 'mabry-bold', color: '#8a8a8a' }}>
                    by Application
                  </Typography>
                </Box>
                <MuiTooltip title="Number of peer under different Application" placement="top">
                  <HelpOutlineOutlinedIcon className={styles.descriptionIcon} />
                </MuiTooltip>
              </Box>

              <Bar options={barOptions} data={applicationBar} />
            </Card>
            <Card className={styles.doughnutContainer}>
              <Box>
                <Box className={styles.doughnutTitle}>
                  <Box>
                    <Typography variant="subtitle2" component="span" sx={{ fontFamily: 'mabry-bold' }}>
                      Peer Statistics&nbsp;
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      component="span"
                      sx={{ fontFamily: 'mabry-bold', color: '#8a8a8a' }}
                    >
                      by Application
                    </Typography>
                  </Box>
                  <MuiTooltip title="Number of peer and active proportion under different Application" placement="top">
                    <HelpOutlineOutlinedIcon className={styles.descriptionIcon} />
                  </MuiTooltip>
                </Box>
                <Divider className={styles.divider} />
                <Box className={styles.pieWrapper}>
                  <Pie options={doughnutOptions} data={applicationDoughnut} />
                </Box>
              </Box>
              <Box className={styles.activeContainer}>
                {/* <Active className={styles.activeIcon} /> */}
                <Box sx={{ width: '100%' }}>
                  <Box className={styles.activeContent}>
                    <Typography variant="subtitle2" fontFamily="mabry-light">
                      Application
                    </Typography>
                    <Typography id="git-version-active" variant="subtitle1" fontFamily="mabry-bold">
                      {isLoading ? <Skeleton width="2rem" /> : applicationSuccess ? `${applicationSuccess}%` : '0'}
                    </Typography>
                  </Box>
                  <LinearProgress
                    sx={{
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'var(--palette-description-color)',
                      },
                    }}
                    variant="determinate"
                    value={applicationSuccess ? applicationSuccess : 0}
                  />
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>
        <Box className={styles.visualizationWrapper} mt="2rem">
          <Box className={styles.dashboard}>
            <Card className={styles.barContainer}>
              <Box className={styles.barTitle}>
                <Box>
                  <Typography variant="subtitle1" component="span" sx={{ fontFamily: 'mabry-bold' }}>
                    Peer Statistics&nbsp;
                  </Typography>
                  <Typography variant="subtitle1" component="span" sx={{ fontFamily: 'mabry-bold', color: '#8a8a8a' }}>
                    by Tag
                  </Typography>
                </Box>
                <MuiTooltip title="Number of peer under different Application" placement="top">
                  <HelpOutlineOutlinedIcon className={styles.descriptionIcon} />
                </MuiTooltip>
              </Box>

              <Bar options={barOptions} data={tagBar} />
            </Card>
            <Card className={styles.doughnutContainer}>
              <Box>
                <Box className={styles.doughnutTitle}>
                  <Box>
                    <Typography variant="subtitle2" component="span" sx={{ fontFamily: 'mabry-bold' }}>
                      Peer Statistics&nbsp;
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      component="span"
                      sx={{ fontFamily: 'mabry-bold', color: '#8a8a8a' }}
                    >
                      by Tag
                    </Typography>
                  </Box>
                  <MuiTooltip title="Number of peer and active proportion under different Application" placement="top">
                    <HelpOutlineOutlinedIcon className={styles.descriptionIcon} />
                  </MuiTooltip>
                </Box>
                <Divider className={styles.divider} />
                <Box className={styles.pieWrapper}>
                  <Pie options={doughnutOptions} data={tagDoughnut} />
                </Box>
              </Box>
              <Box className={styles.activeContainer}>
                {/* <Active className={styles.activeIcon} /> */}
                <Box sx={{ width: '100%' }}>
                  <Box className={styles.activeContent}>
                    <Typography variant="subtitle2" fontFamily="mabry-light">
                      Tag
                    </Typography>
                    <Typography id="git-version-active" variant="subtitle1" fontFamily="mabry-bold">
                      {isLoading ? <Skeleton width="2rem" /> : tagSuccess ? `${tagSuccess}%` : '0'}
                    </Typography>
                  </Box>
                  <LinearProgress
                    sx={{
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'var(--palette-description-color)',
                      },
                    }}
                    variant="determinate"
                    value={tagSuccess ? tagSuccess : 0}
                  />
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
    </div>
  );
}
