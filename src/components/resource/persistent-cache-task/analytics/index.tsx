import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { getPersistentCacheTasksResponse } from '../../../../lib/api';
import { useEffect, useMemo, useState } from 'react';
import { Box, Skeleton, Typography, Tooltip as MuiTooltip, Divider, LinearProgress, useTheme } from '@mui/material';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { ReactComponent as Total } from '../../../../assets/images/cluster/peer/total.svg';
import { ReactComponent as Application } from '../../../../assets/images/resource/persistent-cache-task/header-application.svg';
import { ReactComponent as Tag } from '../../../../assets/images/resource/persistent-cache-task/header-tag.svg';
import { ReactComponent as Success } from '../../../../assets/images/cluster/default.svg';
import styles from './index.module.css';
import Card from '../../../card';
import type { ChartOptions } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function aggregateByField(data: getPersistentCacheTasksResponse[], field: 'application' | 'tag') {
  return Object.entries(
    data.reduce<{ [key: string]: number }>((acc, curr) => {
      const value = curr[field];
      if (!value) return acc;
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, count]) => ({ name, count }));
}

function getFieldStats(data: getPersistentCacheTasksResponse[], field: 'application' | 'tag') {
  const count = data.filter((item) => item[field]).length;
  const percentage = data.length ? +((count / data.length) * 100).toFixed(2) : 0;
  return { count, percentage };
}

interface InformationProps {
  persistentCacheTasks: getPersistentCacheTasksResponse[];
  isLoading: boolean;
}

export default function Analytics({ persistentCacheTasks, isLoading }: InformationProps) {
  const [application, setApplication] = useState<{ name: string; count: number }[]>([]);
  const [tag, setTag] = useState<{ name: string; count: number }[]>([]);
  const [applicationCount, setApplicationCount] = useState(0);
  const [tagCount, setTagCount] = useState(0);
  const [applicationPercentage, setApplicationPercentage] = useState(0);
  const [tagPercentage, setTagPercentage] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    if (!persistentCacheTasks?.length) return;

    const appStats = getFieldStats(persistentCacheTasks, 'application');
    const tagStats = getFieldStats(persistentCacheTasks, 'tag');

    setApplicationCount(appStats.count);
    setApplicationPercentage(appStats.percentage);
    setTagCount(tagStats.count);
    setTagPercentage(tagStats.percentage);
    setApplication(aggregateByField(persistentCacheTasks, 'application'));
    setTag(aggregateByField(persistentCacheTasks, 'tag'));
  }, [persistentCacheTasks]);



  const barOptions: ChartOptions<'bar'> = useMemo(
    () => ({
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: theme.palette.mode === 'dark' ? '#043B34' : '#E8F5E9',
          titleColor: theme.palette.mode === 'dark' ? '#A5D6A7' : '#1B5E20',
          bodyColor: theme.palette.mode === 'dark' ? '#B9F6CA' : '#2E7D32',
          borderWidth: 1,
          borderColor: theme.palette.mode === 'dark' ? '#1B5E20' : '#C8E6C9',
          cornerRadius: 6,
        },
      },
      scales: {
        x: { grid: { color: 'rgba(0,0,0,0)' }, ticks: { color: theme.palette.text.secondary } },
        y: {
          grid: { color: theme.palette.mode === 'dark' ? '#004D40' : '#E0F2F1' },
          ticks: { color: theme.palette.text.secondary },
        },
      },
      elements: { bar: { borderRadius: 6 } },
      hover: { mode: 'nearest', intersect: true },
      animation: { duration: 800, easing: 'easeOutQuart' },
    }),
    [theme.palette.mode, theme.palette.text.secondary],
  );

  const doughnutOptions: ChartOptions<'pie'> = useMemo(
    () => ({
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: theme.palette.text.primary, padding: 12, font: { size: 13 } },
        },
        tooltip: {
          backgroundColor: theme.palette.mode === 'dark' ? '#043B34' : '#E8F5E9',
          titleColor: theme.palette.mode === 'dark' ? '#A5D6A7' : '#1B5E20',
          bodyColor: theme.palette.mode === 'dark' ? '#B9F6CA' : '#2E7D32',
        },
      },
      cutout: application.length === 1 ? '40%' : '68%',
      animation: { animateRotate: true, duration: 1000, easing: 'easeOutCubic' },
    }),
    [theme.palette.mode, theme.palette.text.primary, application.length],
  );

  const applicationBar = {
    labels: application.map((i) => i.name),
    datasets: [
      {
        label: 'Application',
        data: application.map((i) => i.count),
        backgroundColor: (ctx: any) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
          const colors = theme.palette.mode === 'dark' ? ['#00E676', '#009688'] : ['#66BB6A', '#26A69A'];
          gradient.addColorStop(0, colors[0]);
          gradient.addColorStop(1, colors[1]);
          return gradient;
        },
        hoverBackgroundColor: (ctx: any) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
          const colors = theme.palette.mode === 'dark' ? ['#00CB69', '#008C74'] : ['#5AA360', '#1E9088'];
          gradient.addColorStop(0, colors[0]);
          gradient.addColorStop(1, colors[1]);
          return gradient;
        },
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };
  const tagBar = {
    labels: tag.map((i) => i.name),
    datasets: [
      {
        label: 'Tag',
        data: tag.map((i) => i.count),
        backgroundColor: (ctx: any) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
          const colors = theme.palette.mode === 'dark' ? ['#00E676', '#009688'] : ['#66BB6A', '#26A69A'];
          gradient.addColorStop(0, colors[0]);
          gradient.addColorStop(1, colors[1]);
          return gradient;
        },
        hoverBackgroundColor: (ctx: any) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
          const colors = theme.palette.mode === 'dark' ? ['#00CB69', '#008C74'] : ['#5AA360', '#1E9088'];
          gradient.addColorStop(0, colors[0]);
          gradient.addColorStop(1, colors[1]);
          return gradient;
        },
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };
  const applicationDoughnut = {
    labels: application.map((i) => i.name),
    datasets: [
      {
        label: 'Application',
        data: application.map((i) => i.count),
        backgroundColor:
          theme.palette.mode === 'dark'
            ? ['#01A76F', '#5BE49B', '#C8FAD6', '#004B50', '#007868']
            : [
                'rgba(67,160,71,0.95)',
                'rgba(76,175,80,0.9)',
                'rgba(102,187,106,0.85)',
                'rgba(129,199,132,0.8)',
                'rgba(165,214,167,0.75)',
              ],
        borderWidth: 2,
        borderColor: theme.palette.background.paper,
        hoverOffset: 8,
      },
    ],
  };
  const tagDoughnut = {
    labels: tag.map((i) => i.name),
    datasets: [
      {
        label: 'Tag',
        data: tag.map((i) => i.count),
        backgroundColor:
          theme.palette.mode === 'dark'
            ? ['#01A76F', '#5BE49B', '#C8FAD6', '#004B50', '#007868']
            : [
                'rgba(67,160,71,0.95)',
                'rgba(76,175,80,0.9)',
                'rgba(102,187,106,0.85)',
                'rgba(129,199,132,0.8)',
                'rgba(165,214,167,0.75)',
              ],
        borderWidth: 2,
        borderColor: theme.palette.background.paper,
        hoverOffset: 8,
      },
    ],
  };

  const renderSkeletonOrCount = (isLoading: boolean, id: string, count: number) =>
    isLoading ? (
      <Box p="0.4rem 0">
        <Skeleton height={40} data-testid="isloading" width="2rem" />
      </Box>
    ) : (
      <Typography id={id} variant="h5" p="0.7rem 0">
        {count}
      </Typography>
    );

  return (
    <Box>
      {/* Summary Cards */}
      <Box className={styles.navigationContainer}>
        {/* Total */}
        <Card className={styles.navigationWrapper}>
          <Box>
            <Typography variant="subtitle2" fontFamily="mabry-bold" color="var(--palette-table-title-text-color)">
              Total
            </Typography>
            {renderSkeletonOrCount(isLoading, 'total', persistentCacheTasks.length)}
            <Typography variant="body2" color="var(--palette-table-title-text-color)">
              number of persistent cache tasks
            </Typography>
          </Box>
          <Total className={styles.navigationIcon} />
        </Card>

        {/* Application */}
        <Card className={styles.navigationWrapper}>
          <Box>
            <Typography variant="subtitle2" fontFamily="mabry-bold" color="var(--palette-table-title-text-color)">
              Application
            </Typography>
            {renderSkeletonOrCount(isLoading, 'application', applicationCount)}
            <Typography variant="body2" color="var(--palette-table-title-text-color)">
              number of application
            </Typography>
          </Box>
          <Application className={styles.navigationIcon} />
        </Card>

        {/* Tag */}
        <Card className={styles.navigationWrapper}>
          <Box>
            <Typography variant="subtitle2" fontFamily="mabry-bold" color="var(--palette-table-title-text-color)">
              Tag
            </Typography>
            {renderSkeletonOrCount(isLoading, 'tag', tagCount)}
            <Typography variant="body2" color="var(--palette-table-title-text-color)">
              number of tag
            </Typography>
          </Box>
          <Tag className={styles.navigationIcon} />
        </Card>
      </Box>

      {/* Visualization */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        {/* Application Visualization */}
        <Box className={styles.visualizationWrapper}>
          <Box className={styles.dashboard}>
            <Card className={styles.barContainer}>
              <Box className={styles.barTitle}>
                <Typography variant="subtitle1" sx={{ fontFamily: 'mabry-bold' }}>
                  Persistent cache tasks Statistics <span style={{ color: '#8a8a8a' }}>by Application</span>
                </Typography>
                <MuiTooltip title="Number of Persistent cache tasks under different Application" placement="top">
                  <HelpOutlineOutlinedIcon className={styles.descriptionIcon} />
                </MuiTooltip>
              </Box>
              <Bar options={barOptions} data={applicationBar} />
            </Card>
            <Card className={styles.doughnutContainer}>
              <Box>
                <Box className={styles.doughnutTitle}>
                  <Typography variant="subtitle2" sx={{ fontFamily: 'mabry-bold' }}>
                    Persistent cache tasks Statistics <span style={{ color: '#8a8a8a' }}>by Application</span>
                  </Typography>
                  <MuiTooltip title="Number of Persistent cache tasks under different Application" placement="top">
                    <HelpOutlineOutlinedIcon className={styles.descriptionIcon} />
                  </MuiTooltip>
                </Box>
                <Divider className={styles.divider} />
                <Box className={styles.pieWrapper}>
                  <Pie options={doughnutOptions} data={applicationDoughnut} />
                </Box>
              </Box>
              <Box className={styles.tagContainer}>
                <Success className={styles.tagIcon} />
                <Box sx={{ width: '100%' }}>
                  <Box className={styles.tagContent}>
                    <Typography variant="subtitle2" fontFamily="mabry-light">
                      Application
                    </Typography>
                    <Typography id="application-ratio" variant="subtitle1" fontFamily="mabry-bold">
                      {isLoading ? <Skeleton width="2rem" /> : `${applicationPercentage || 0}%`}
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
                    value={applicationPercentage || 0}
                  />
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>

        {/* Tag Visualization */}
        <Box className={styles.visualizationWrapper} mt="2rem">
          <Box className={styles.dashboard}>
            <Card className={styles.barContainer}>
              <Box className={styles.barTitle}>
                <Typography variant="subtitle1" sx={{ fontFamily: 'mabry-bold' }}>
                  Persistent cache task Statistics <span style={{ color: '#8a8a8a' }}>by Tag</span>
                </Typography>
                <MuiTooltip title="Number of persistent cache tasks under different tag" placement="top">
                  <HelpOutlineOutlinedIcon className={styles.descriptionIcon} />
                </MuiTooltip>
              </Box>
              <Bar options={barOptions} data={tagBar} />
            </Card>

            <Card className={styles.doughnutContainer}>
              <Box>
                <Box className={styles.doughnutTitle}>
                  <Typography variant="subtitle2" sx={{ fontFamily: 'mabry-bold' }}>
                    Persistent cache tasks Statistics <span style={{ color: '#8a8a8a' }}>by Tag</span>
                  </Typography>
                  <MuiTooltip title="Number of persistent cache tasks under different tag" placement="top">
                    <HelpOutlineOutlinedIcon className={styles.descriptionIcon} />
                  </MuiTooltip>
                </Box>
                <Divider className={styles.divider} />
                <Box className={styles.pieWrapper}>
                  <Pie options={doughnutOptions} data={tagDoughnut} />
                </Box>
              </Box>
              <Box className={styles.tagContainer}>
                <Success className={styles.tagIcon} />
                <Box sx={{ width: '100%' }}>
                  <Box className={styles.tagContent}>
                    <Typography variant="subtitle2" fontFamily="mabry-light">
                      Tag
                    </Typography>
                    <Typography id="tag-ratio" variant="subtitle1" fontFamily="mabry-bold">
                      {isLoading ? <Skeleton width="2rem" /> : `${tagPercentage || 0}%`}
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
                    value={tagPercentage || 0}
                  />
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
