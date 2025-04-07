import React, { useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  ComposedChart, Scatter, BoxPlot
} from 'recharts';
import { Box, Paper, Typography, Grid, Divider } from '@mui/material';

function HodAnalytics({ applications }) {
  // Status Distribution Data
  const statusData = useMemo(() => {
    const counts = applications.reduce((acc, app) => {
      const fpcStatus = `FPC ${app.fpc_status || 'Pending'}`;
      const hodStatus = `HOD ${app.hod_status || 'Pending'}`;
      acc[fpcStatus] = (acc[fpcStatus] || 0) + 1;
      acc[hodStatus] = (acc[hodStatus] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([status, value]) => ({ name: status, value }));
  }, [applications]);

  // Department Statistics
  const departmentData = useMemo(() => {
    const deptStats = applications.reduce((acc, app) => {
      if (!acc[app.department]) {
        acc[app.department] = {
          name: app.department,
          totalApplications: 0,
          approved: 0,
          avgStipend: 0,
          ppoOffers: 0,
          stipendSum: 0
        };
      }
      const dept = acc[app.department];
      dept.totalApplications++;
      if (app.hod_status === 'Approved') dept.approved++;
      if (app.internship_type === 'Internship with PPO') dept.ppoOffers++;
      dept.stipendSum += Number(app.stipend) || 0;
      dept.avgStipend = dept.stipendSum / dept.totalApplications;
      dept.successRate = (dept.approved / dept.totalApplications) * 100;
      return acc;
    }, {});
    return Object.values(deptStats);
  }, [applications]);

  // Monthly Trends
  const monthlyTrends = useMemo(() => {
    const trends = applications.reduce((acc, app) => {
      const month = new Date(app.created_at).toLocaleString('default', { month: 'short' });
      if (!acc[month]) {
        acc[month] = {
          month,
          submissions: 0,
          approvals: 0,
          avgProcessingTime: 0,
          totalProcessingTime: 0
        };
      }
      acc[month].submissions++;
      if (app.hod_status === 'Approved') {
        acc[month].approvals++;
        const processTime = new Date(app.updated_at) - new Date(app.created_at);
        acc[month].totalProcessingTime += processTime;
        acc[month].avgProcessingTime = acc[month].totalProcessingTime / acc[month].approvals;
      }
      return acc;
    }, {});
    return Object.values(trends);
  }, [applications]);

  // Stipend and PPO Statistics
  const stipendStats = useMemo(() => {
    const companyStats = applications.reduce((acc, app) => {
      if (!acc[app.company_name]) {
        acc[app.company_name] = {
          company: app.company_name,
          stipends: [],
          ppoPackages: []
        };
      }
      acc[app.company_name].stipends.push(Number(app.stipend) || 0);
      if (app.ppo_package) {
        acc[app.company_name].ppoPackages.push(Number(app.ppo_package));
      }
      return acc;
    }, {});

    return Object.entries(companyStats).map(([company, data]) => ({
      company,
      medianStipend: median(data.stipends),
      avgStipend: average(data.stipends),
      medianPPO: median(data.ppoPackages),
      avgPPO: average(data.ppoPackages)
    }));
  }, [applications]);

  const COLORS = ['#d05c24', '#f17d4a', '#2196f3', '#4caf50', '#ff9800'];

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Status Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Application Status Distribution
            </Typography>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Department Statistics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Department Performance
            </Typography>
            <ResponsiveContainer>
              <ComposedChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="totalApplications" fill="#d05c24" name="Total" />
                <Bar yAxisId="left" dataKey="approved" fill="#4caf50" name="Approved" />
                <Line yAxisId="right" type="monotone" dataKey="successRate" stroke="#2196f3" name="Success Rate %" />
                <Scatter yAxisId="right" dataKey="avgStipend" fill="#ff9800" name="Avg Stipend" />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Monthly Trends */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Monthly Submission Trends
            </Typography>
            <ResponsiveContainer>
              <ComposedChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="submissions" fill="#d05c24" name="Submissions" />
                <Line yAxisId="left" type="monotone" dataKey="approvals" stroke="#4caf50" name="Approvals" />
                <Line yAxisId="right" type="monotone" dataKey="avgProcessingTime" stroke="#2196f3" name="Avg Processing Time" />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Stipend and PPO Statistics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Company-wise Compensation Analysis
            </Typography>
            <ResponsiveContainer>
              <ComposedChart data={stipendStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="company" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="medianStipend" fill="#d05c24" name="Median Stipend" />
                <Bar yAxisId="left" dataKey="avgStipend" fill="#f17d4a" name="Avg Stipend" />
                <Line yAxisId="right" type="monotone" dataKey="medianPPO" stroke="#2196f3" name="Median PPO" />
                <Line yAxisId="right" type="monotone" dataKey="avgPPO" stroke="#4caf50" name="Avg PPO" />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

// Utility functions for calculations
const median = arr => {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const average = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

export default HodAnalytics;