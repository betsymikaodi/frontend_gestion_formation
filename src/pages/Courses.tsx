import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { Course } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Courses = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      name: 'Formation React Avancé',
      description: 'Formation complète sur React avec hooks, context et patterns avancés',
      fee: 1500,
      duration: 90
    },
    {
      id: '2', 
      name: 'Formation Node.js',
      description: 'Développement backend avec Node.js, Express et MongoDB',
      fee: 1200,
      duration: 60
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Add course form state
  const [addForm, setAddForm] = useState({
    name: '',
    description: '',
    fee: '',
    duration: ''
  });

  // Edit course form state  
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    fee: '',
    duration: ''
  });

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCourse = () => {
    if (!addForm.name || !addForm.description || !addForm.fee || !addForm.duration) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const newCourse: Course = {
      id: Date.now().toString(),
      name: addForm.name,
      description: addForm.description,
      fee: parseFloat(addForm.fee),
      duration: parseInt(addForm.duration)
    };

    setCourses([...courses, newCourse]);
    setAddForm({ name: '', description: '', fee: '', duration: '' });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Succès",
      description: "Formation ajoutée avec succès"
    });
  };

  const handleEditCourse = () => {
    if (!editForm.name || !editForm.description || !editForm.fee || !editForm.duration) {
      toast({
        title: "Erreur", 
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    if (!editingCourse) return;

    const updatedCourse: Course = {
      ...editingCourse,
      name: editForm.name,
      description: editForm.description,
      fee: parseFloat(editForm.fee),
      duration: parseInt(editForm.duration)
    };

    setCourses(courses.map(course => 
      course.id === editingCourse.id ? updatedCourse : course
    ));
    
    setIsEditDialogOpen(false);
    setEditingCourse(null);
    
    toast({
      title: "Succès",
      description: "Formation mise à jour avec succès"
    });
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter(course => course.id !== courseId));
    toast({
      title: "Succès",
      description: "Formation supprimée avec succès"
    });
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setEditForm({
      name: course.name,
      description: course.description,
      fee: course.fee.toString(),
      duration: course.duration.toString()
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Formations</h1>
          <p className="text-muted-foreground">
            Gérez vos formations et cours disponibles
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter Formation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle formation</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-name" className="text-right">
                  Nom *
                </Label>
                <Input
                  id="add-name"
                  value={addForm.name}
                  onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                  className="col-span-3"
                  placeholder="Nom de la formation"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-description" className="text-right">
                  Description *
                </Label>
                <Textarea
                  id="add-description"
                  value={addForm.description}
                  onChange={(e) => setAddForm({...addForm, description: e.target.value})}
                  className="col-span-3"
                  placeholder="Description de la formation"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-fee" className="text-right">
                  Prix (€) *
                </Label>
                <Input
                  id="add-fee"
                  type="number"
                  value={addForm.fee}
                  onChange={(e) => setAddForm({...addForm, fee: e.target.value})}
                  className="col-span-3"
                  placeholder="Prix en euros"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-duration" className="text-right">
                  Durée (jours) *
                </Label>
                <Input
                  id="add-duration"
                  type="number"
                  value={addForm.duration}
                  onChange={(e) => setAddForm({...addForm, duration: e.target.value})}
                  className="col-span-3"
                  placeholder="Ex: 90, 60..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddCourse}>Ajouter</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Rechercher les formations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Rechercher par nom ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Formations ({filteredCourses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Durée (jours)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{course.description}</TableCell>
                  <TableCell>{course.fee}€</TableCell>
                  <TableCell>{course.duration}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(course)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredCourses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune formation trouvée</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier la formation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nom *
              </Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description *
              </Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-fee" className="text-right">
                Prix (€) *
              </Label>
              <Input
                id="edit-fee"
                type="number"
                value={editForm.fee}
                onChange={(e) => setEditForm({...editForm, fee: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-duration" className="text-right">
                Durée (jours) *
              </Label>
              <Input
                id="edit-duration"
                type="number"
                value={editForm.duration}
                onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditCourse}>Sauvegarder</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Courses;