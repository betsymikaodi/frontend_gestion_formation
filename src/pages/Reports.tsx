import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Users,
  BookOpen,
  Download,
  Calendar,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Student, Enrollment } from '@/types';
import { StatisticsService } from '@/services/statistics.service';

const Reports: React.FC = () => {
  const { t } = useTranslation();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [dateRange, setDateRange] = useState('all');
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    loadData();
    fetchStudentCount();
  }, []);

  const fetchStudentCount = async () => {
    try {
      const count = await StatisticsService.getStudentCount();
      setTotalStudents(count);
    } catch (error) {
      console.error("Failed to fetch student count:", error);
    }
  };

  const loadData = () => {
    const storedStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const storedEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    
    setStudents(storedStudents);
    setEnrollments(storedEnrollments);
  };

  // Generate monthly revenue data
  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthEnrollments = enrollments.filter(e => {
        const enrollDate = new Date(e.enrollmentDate);
        return enrollDate.getMonth() === index && enrollDate.getFullYear() === currentYear;
      });
      
      const paidEnrollments = monthEnrollments.filter(e => e.paymentStatus === 'paid');
      
      return {
        month,
        enrollments: monthEnrollments.length,
        revenue: paidEnrollments.reduce((sum, e) => sum + e.fee, 0),
        students: new Set(monthEnrollments.map(e => e.studentId)).size,
      };
    });
  };

  // Course popularity data
  const getCourseData = () => {
    const courseStats = enrollments.reduce((acc, enrollment) => {
      const courseName = enrollment.courseName;
      if (!acc[courseName]) {
        acc[courseName] = { 
          name: courseName, 
          enrollments: 0, 
          revenue: 0,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`
        };
      }
      acc[courseName].enrollments += 1;
      if (enrollment.paymentStatus === 'paid') {
        acc[courseName].revenue += enrollment.fee;
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(courseStats);
  };

  // Payment status data
  const getPaymentStatusData = () => {
    const paid = enrollments.filter(e => e.paymentStatus === 'paid').length;
    const pending = enrollments.filter(e => e.paymentStatus === 'pending').length;
    const overdue = enrollments.filter(e => e.paymentStatus === 'overdue').length;

    return [
      { name: 'Paid', value: paid, color: 'hsl(142, 76%, 36%)' },
      { name: 'Pending', value: pending, color: 'hsl(38, 92%, 50%)' },
      { name: 'Overdue', value: overdue, color: 'hsl(0, 84%, 60%)' },
    ];
  };

  const monthlyData = generateMonthlyData();
  const courseData = getCourseData();
  const paymentStatusData = getPaymentStatusData();

  // Calculate key metrics
  const totalRevenue = enrollments.filter(e => e.paymentStatus === 'paid').reduce((sum, e) => sum + e.fee, 0);
  const totalEnrollments = enrollments.length;
  const avgRevenuePerStudent = totalStudents > 0 ? totalRevenue / totalStudents : 0;

  const keyMetrics = [
    {
      title: t('totalRevenue'),
      value: `$${totalRevenue.toLocaleString()}`,
      change: '+15.3%',
      icon: DollarSign,
      color: 'gradient-primary',
    },
    {
      title: t('totalStudents'),
      value: totalStudents.toString(),
      change: '+8.7%',
      icon: Users,
      color: 'gradient-accent',
    },
    {
      title: t('totalEnrollments'),
      value: totalEnrollments.toString(),
      change: '+12.1%',
      icon: BookOpen,
      color: 'bg-warning',
    },
    {
      title: t('avgRevenuePerStudent'),
      value: `$${Math.round(avgRevenuePerStudent).toLocaleString()}`,
      change: '+6.4%',
      icon: TrendingUp,
      color: 'bg-success',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('reports')}
            </h1>
            <p className="text-muted-foreground">
              {t('analyticsAndInsights')}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40 glass border-border/30">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card">
                <SelectItem value="all">{t('allTime')}</SelectItem>
                <SelectItem value="year">{t('thisYear')}</SelectItem>
                <SelectItem value="month">{t('thisMonth')}</SelectItem>
                <SelectItem value="week">{t('thisWeek')}</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="glass border-border/30">
              <Download className="w-4 h-4 mr-2" />
              {t('export')}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card border-border/30 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {metric.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-2">
                        {metric.value}
                      </p>
                      <p className="text-xs text-success mt-1">
                        {metric.change} {t('fromLastPeriod')}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${metric.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {t('revenueTrends')}
              </CardTitle>
              <CardDescription>
                {t('monthlyRevenueAndEnrollment')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                {t('paymentStatusDistribution')}
              </CardTitle>
              <CardDescription>
                {t('breakdownOfPaymentStatuses')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  paid: { label: "Paid", color: "hsl(142, 76%, 36%)" },
                  pending: { label: "Pending", color: "hsl(38, 92%, 50%)" },
                  overdue: { label: "Overdue", color: "hsl(0, 84%, 60%)" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Course Popularity & Monthly Enrollments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Popularity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {t('coursePopularity')}
              </CardTitle>
              <CardDescription>
                {t('enrollmentsByCourse')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  enrollments: {
                    label: "Enrollments",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courseData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="enrollments" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Enrollments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {t('monthlyEnrollments')}
              </CardTitle>
              <CardDescription>
                {t('enrollmentTrendsByMonth')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  enrollments: {
                    label: "Enrollments",
                    color: "hsl(var(--primary-glow))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="enrollments"
                      stroke="hsl(var(--primary-glow))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary-glow))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;