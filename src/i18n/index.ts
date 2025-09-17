import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: "Dashboard",
      students: "Students",
      enrollments: "Enrollments & Fees",
      reports: "Reports",
      profile: "Profile",
      
      // Authentication
      login: "Login",
      logout: "Logout",
      email: "Email",
      password: "Password",
      role: "Role",
      admin: "Admin",
      user: "User",
      signin: "Sign In",
      createAccount: "Create Account",
      
      // Dashboard
      welcomeBack: "Welcome back",
      totalStudents: "Total Students",
      totalEnrollments: "Total Enrollments",
      pendingPayments: "Pending Payments",
      totalRevenue: "Total Revenue",
      
      // Students
      studentManagement: "Student Management",
      addStudent: "Add Student",
      editStudent: "Edit Student",
      deleteStudent: "Delete Student",
      firstName: "First Name",
      lastName: "Last Name",
      phone: "Phone",
      dateOfBirth: "Date of Birth",
      address: "Address",
      enrollmentDate: "Enrollment Date",
      
      // General
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      search: "Search",
      actions: "Actions",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
      paid: "Paid",
      pending: "Pending",
      overdue: "Overdue",
      
      // Messages
      studentAddedSuccess: "Student added successfully",
      studentUpdatedSuccess: "Student updated successfully",
      studentDeletedSuccess: "Student deleted successfully",
      loginSuccess: "Login successful",
      logoutSuccess: "Logout successful",
    }
  },
  fr: {
    translation: {
      // Navigation
      dashboard: "Tableau de bord",
      students: "Étudiants",
      enrollments: "Inscriptions et frais",
      reports: "Rapports",
      profile: "Profil",
      
      // Authentication
      login: "Connexion",
      logout: "Déconnexion",
      email: "Email",
      password: "Mot de passe",
      role: "Rôle",
      admin: "Administrateur",
      user: "Utilisateur",
      signin: "Se connecter",
      createAccount: "Créer un compte",
      
      // Dashboard
      welcomeBack: "Bon retour",
      totalStudents: "Total des étudiants",
      totalEnrollments: "Total des inscriptions",
      pendingPayments: "Paiements en attente",
      totalRevenue: "Revenus totaux",
      
      // Students
      studentManagement: "Gestion des étudiants",
      addStudent: "Ajouter un étudiant",
      editStudent: "Modifier l'étudiant",
      deleteStudent: "Supprimer l'étudiant",
      firstName: "Prénom",
      lastName: "Nom de famille",
      phone: "Téléphone",
      dateOfBirth: "Date de naissance",
      address: "Adresse",
      enrollmentDate: "Date d'inscription",
      
      // General
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      edit: "Modifier",
      view: "Voir",
      search: "Rechercher",
      actions: "Actions",
      status: "Statut",
      active: "Actif",
      inactive: "Inactif",
      paid: "Payé",
      pending: "En attente",
      overdue: "En retard",
      
      // Messages
      studentAddedSuccess: "Étudiant ajouté avec succès",
      studentUpdatedSuccess: "Étudiant mis à jour avec succès",
      studentDeletedSuccess: "Étudiant supprimé avec succès",
      loginSuccess: "Connexion réussie",
      logoutSuccess: "Déconnexion réussie",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;