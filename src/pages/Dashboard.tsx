import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAuth } from '@/contexts/AuthContext';
import { Student, Enrollment } from '@/types';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    // Load data from localStorage
    const storedStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const storedEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    
    setStudents(storedStudents);
    setEnrollments(storedEnrollments);

    // Initialize sample data if none exists
    if (storedStudents.length === 0) {
      initializeSampleData();
    }
  }, []);

  const initializeSampleData = () => {
    const sampleStudents: Student[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1-555-0101',
        dateOfBirth: '1995-05-15',
        address: '123 Main St, City, State',
        enrollmentDate: '2024-01-15',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@email.com',
        phone: '+1-555-0102',
        dateOfBirth: '1992-08-22',
        address: '456 Oak Ave, City, State',
        enrollmentDate: '2024-02-01',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@email.com',
        phone: '+1-555-0103',
        dateOfBirth: '1990-12-10',
        address: '789 Pine Rd, City, State',
        enrollmentDate: '2024-01-08',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ];

    const sampleEnrollments: Enrollment[] = [
      {
        id: '1',
        studentId: '1',
        courseId: 'course-1',
        courseName: 'Web Development Bootcamp',
        fee: 2500,
        paymentStatus: 'paid',
        enrollmentDate: '2024-01-15',
        dueDate: '2024-02-15',
        paidDate: '2024-01-20',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        studentId: '2',
        courseId: 'course-2',
        courseName: 'Data Science Course',
        fee: 3000,
        paymentStatus: 'pending',
        enrollmentDate: '2024-02-01',
        dueDate: '2024-03-01',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        studentId: '3',
        courseId: 'course-1',
        courseName: 'Web Development Bootcamp',
        fee: 2500,
        paymentStatus: 'overdue',
        enrollmentDate: '2024-01-08',
        dueDate: '2024-02-08',
        createdAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem('students', JSON.stringify(sampleStudents));
    localStorage.setItem('enrollments', JSON.stringify(sampleEnrollments));
    
    setStudents(sampleStudents);
    setEnrollments(sampleEnrollments);
  };

  // Calculate metrics
  const totalStudents = students.length;
  const totalEnrollments = enrollments.length;
  const pendingPayments = enrollments.filter(e => e.paymentStatus === 'pending' || e.paymentStatus === 'overdue').length;
  const totalRevenue = enrollments
    .filter(e => e.paymentStatus === 'paid')
    .reduce((sum, e) => sum + e.fee, 0);

  // Chart data
  const monthlyData = [
    { month: 'Jan', enrollments: 12, revenue: 30000 },
    { month: 'Feb', enrollments: 19, revenue: 47500 },
    { month: 'Mar', enrollments: 8, revenue: 20000 },
    { month: 'Apr', enrollments: 15, revenue: 37500 },
    { month: 'May', enrollments: 22, revenue: 55000 },
    { month: 'Jun', enrollments: 18, revenue: 45000 },
  ];

  const paymentStatusData = [
    { name: 'Paid', value: enrollments.filter(e => e.paymentStatus === 'paid').length, color: 'hsl(142 76% 36%)' },
    { name: 'Pending', value: enrollments.filter(e => e.paymentStatus === 'pending').length, color: 'hsl(38 92% 50%)' },
    { name: 'Overdue', value: enrollments.filter(e => e.paymentStatus === 'overdue').length, color: 'hsl(0 84% 60%)' },
  ];

  const statsCards = [
    {
      title: t('totalStudents'),
      value: totalStudents.toString(),
      icon: Users,
      gradient: 'gradient-primary',
      change: '+12%',
    },
    {
      title: t('totalEnrollments'),
      value: totalEnrollments.toString(),
      icon: BookOpen,
      gradient: 'gradient-accent',
      change: '+8%',
    },
    {
      title: t('pendingPayments'),
      value: pendingPayments.toString(),
      icon: AlertCircle,
      gradient: 'bg-warning',
      change: '-3%',
    },
    {
      title: t('totalRevenue'),
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: 'bg-success',
      change: '+15%',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t('welcomeBack')}, {user?.firstName}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your training management system today.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card className="glass-card border-border/30 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-2">
                        {stat.value}
                      </p>
                      <p className="text-xs text-success mt-1">
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.gradient} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Monthly Trends
              </CardTitle>
              <CardDescription>
                Enrollments and revenue over time
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
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="enrollments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
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
                <DollarSign className="w-5 h-5" />
                Payment Status
              </CardTitle>
              <CardDescription>
                Distribution of payment statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  paid: {
                    label: "Paid",
                    color: "hsl(142 76% 36%)",
                  },
                  pending: {
                    label: "Pending", 
                    color: "hsl(38 92% 50%)",
                  },
                  overdue: {
                    label: "Overdue",
                    color: "hsl(0 84% 60%)",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {paymentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-card border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest enrollments and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrollments.slice(0, 3).map((enrollment) => {
                const student = students.find(s => s.id === enrollment.studentId);
                return (
                  <div key={enrollment.id} className="flex items-center justify-between p-4 glass rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {student?.firstName} {student?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {enrollment.courseName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        ${enrollment.fee.toLocaleString()}
                      </p>
                      <p className={`text-sm ${
                        enrollment.paymentStatus === 'paid' ? 'text-success' :
                        enrollment.paymentStatus === 'pending' ? 'text-warning' :
                        'text-destructive'
                      }`}>
                        {enrollment.paymentStatus}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;