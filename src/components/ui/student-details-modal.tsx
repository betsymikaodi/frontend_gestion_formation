import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Paiement {
  idPaiement: number;
  datePaiement: string;
  montant: number;
  modePaiement: string;
  module: string;
}

interface Inscription {
  idInscription: number;
  dateInscription: string;
  statut: string;
  droitInscription: number;
  paiements: Paiement[];
  montantTotalPaye: number;
  montantRestant: number;
}

interface Apprenant {
  idApprenant?: number;
  nom: string;
  prenom:string;
  email: string;
  telephone?: string;
  adresse?: string;
  dateNaissance?: string;
  cin: string;
  nomComplet?: string;
  inscriptions?: Inscription[];
}

interface StudentDetailsModalProps {
  student: Apprenant | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ student, isOpen, onOpenChange }) => {
  const { t } = useTranslation();

  if (!student) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA' }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('studentDetailsTitle', { name: student.nomComplet || `${student.prenom} ${student.nom}` })}</DialogTitle>
          <DialogDescription>
            {t('studentDetailsDescription', { id: student.idApprenant })}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-4">
          <div className="space-y-6">
            {/* Informations personnelles */}
            <Card>
              <CardHeader>
                <CardTitle>{t('personalInformation')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>{t('lastName')}:</strong> {student.nom}</div>
                  <div><strong>{t('firstName')}:</strong> {student.prenom}</div>
                  <div><strong>{t('email')}:</strong> {student.email}</div>
                  <div><strong>{t('phone')}:</strong> {student.telephone || 'N/A'}</div>
                  <div><strong>{t('address')}:</strong> {student.adresse || 'N/A'}</div>
                  <div><strong>{t('dateOfBirth')}:</strong> {formatDate(student.dateNaissance)}</div>
                  <div><strong>{t('cin')}:</strong> {student.cin}</div>
                </div>
              </CardContent>
            </Card>

            {/* Inscriptions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('enrollments')}</CardTitle>
              </CardHeader>
              <CardContent>
                {student.inscriptions && student.inscriptions.length > 0 ? (
                  <div className="space-y-4">
                    {student.inscriptions.map((inscription) => (
                      <div key={inscription.idInscription} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{t('enrollment')} #{inscription.idInscription}</h4>
                            <Badge variant={inscription.statut === 'Confirmé' ? 'default' : 'secondary'}>
                                {inscription.statut}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                          <div><strong>{t('enrollmentDate')}:</strong> {formatDate(inscription.dateInscription)}</div>
                          <div><strong>{t('registrationFee')}:</strong> {formatCurrency(inscription.droitInscription)}</div>
                          <div><strong>{t('totalPaid')}:</strong> <span className="text-green-600">{formatCurrency(inscription.montantTotalPaye)}</span></div>
                          <div><strong>{t('remainingAmount')}:</strong> <span className="text-red-600">{formatCurrency(inscription.montantRestant)}</span></div>
                        </div>
                        
                        <h5 className="font-semibold mb-2 mt-4">{t('payments')}</h5>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('paymentDate')}</TableHead>
                              <TableHead>{t('module')}</TableHead>
                              <TableHead>{t('paymentMethod')}</TableHead>
                              <TableHead className="text-right">{t('amount')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {inscription.paiements && inscription.paiements.length > 0 ? (
                              inscription.paiements.map((paiement) => (
                                <TableRow key={paiement.idPaiement}>
                                  <TableCell>{formatDate(paiement.datePaiement)}</TableCell>
                                  <TableCell>{paiement.module}</TableCell>
                                  <TableCell>{paiement.modePaiement}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(paiement.montant)}</TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center">{t('noPaymentsFound')}</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('noEnrollmentsFound')}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailsModal;
