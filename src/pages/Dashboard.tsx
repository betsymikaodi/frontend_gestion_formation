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
  GraduationCap,
  BookCheck,
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
  Tooltip,
  Legend,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { StatisticsService } from '@/services/statistics.service';
import { formatAriary } from '@/lib/format';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, activities] = await Promise.all([
        StatisticsService.getDashboardStats(),
        StatisticsService.getRecentActivities()
      ]);
      
      setStats(dashboardStats);
      setRecentActivities(activities);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les données du tableau de bord",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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

  // Chart data
  const monthlyData = stats?.inscriptionsParMois?.map((data: any) => ({
    mois: data.mois,
    inscriptions: data.nombre,
    revenus: data.montant
  })) || [];

  const paymentStatusData = [
    { 
      name: 'Confirmé',
      value: stats?.inscriptionsConfirmees || 0,
      color: 'hsl(142 76% 36%)'
    },
    { 
      name: 'En attente',
      value: stats?.inscriptionsEnAttente || 0,
      color: 'hsl(38 92% 50%)'
    },
    { 
      name: 'Annulé',
      value: stats?.inscriptionsAnnulees || 0,
      color: 'hsl(0 84% 60%)'
    }
  ];

  const statsCards = stats ? [
    {
      title: t("students"),
      value: stats.totalApprenants.toString(),
      icon: Users,
      gradient: 'gradient-primary'
    },
    {
      title: t("courses"),
      value: stats.totalFormations.toString(),
      icon: GraduationCap,
      gradient: 'bg-violet-500'
    },
    {
      title: t("enrollments"),
      value: stats.totalInscriptions.toString(),
      icon: BookCheck,
      gradient: 'gradient-accent'
    },
    {
      title: t("totalRevenue"),
      value: formatAriary(stats.totalRevenue) + " Ar",
      icon: DollarSign,
      gradient: 'bg-success'
    },
  ] : [];

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
          {t('welcomeMessage')}
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
                        {stat.change} {t('fromLastMonth')}
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
                {t('monthlyTrends')}
              </CardTitle>
              <CardDescription>
                {t('enrollmentsAndRevenueOverTime')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [
                        value.toString(),
                        value.toString().includes("Ar") ? "Revenus" : "Inscriptions"
                      ]}
                    />
                    <Legend />
                    <Bar 
                      name="Inscriptions" 
                      dataKey="inscriptions" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      name="Revenus" 
                      dataKey="revenus" 
                      fill="hsl(var(--success))" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
                {t('paymentStatus')}
              </CardTitle>
              <CardDescription>
                {t('paymentStatusDistribution')}
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
              {t('recentActivity')}
            </CardTitle>
            <CardDescription>
              {t('latestEnrollmentsAndPayments')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 glass rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {activity.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {activity.montant && (
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatAriary(activity.montant)} Ar
                      </p>
                      <p className={`text-sm ${
                        activity.type === 'paiement' ? 'text-success' :
                        activity.type === 'inscription' ? 'text-warning' :
                        'text-info'
                      }`}>
                        {activity.type}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {t('noRecentActivity')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;