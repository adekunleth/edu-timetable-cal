import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function Subjects() {
  const subjects = [
    {
      code: "BIO101",
      name: "Anatomy Basics",
      semester: "Semester 1",
      campus: "Sydney Campus",
      cohort: "Nursing 2025",
      instructor: "Dr. Nguyen",
      type: "Lecture",
      credits: 4,
      students: 45,
    },
    {
      code: "CHEM202",
      name: "Organic Chemistry",
      semester: "Semester 1",
      campus: "Sydney Campus",
      cohort: "Science 2024",
      instructor: "Prof. Smith",
      type: "Lab",
      credits: 3,
      students: 32,
    },
    {
      code: "MATH301",
      name: "Advanced Calculus",
      semester: "Semester 1",
      campus: "Melbourne Campus",
      cohort: "Engineering 2023",
      instructor: "Ms. Johnson",
      type: "Tutorial",
      credits: 4,
      students: 28,
    },
    {
      code: "PHYS202",
      name: "Quantum Physics",
      semester: "Semester 1",
      campus: "Sydney Campus",
      cohort: "Physics 2024",
      instructor: "Dr. Williams",
      type: "Lecture",
      credits: 4,
      students: 38,
    },
    {
      code: "CS401",
      name: "AI Workshop",
      semester: "Semester 1",
      campus: "Melbourne Campus",
      cohort: "Computer Science 2023",
      instructor: "Prof. Chen",
      type: "Workshop",
      credits: 3,
      students: 25,
    },
  ];

  const typeColors: Record<string, string> = {
    Lecture: "bg-lecture/10 text-lecture",
    Lab: "bg-lab/10 text-lab",
    Tutorial: "bg-tutorial/10 text-tutorial",
    Workshop: "bg-workshop/10 text-workshop",
    Online: "bg-online/10 text-online",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Subjects & Units
          </h2>
          <p className="text-muted-foreground">
            Manage subjects, allocations, and delivery modes
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex gap-4 p-4">
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option>All Semesters</option>
            <option>Semester 1</option>
            <option>Semester 2</option>
          </select>
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option>All Campuses</option>
            <option>Sydney Campus</option>
            <option>Melbourne Campus</option>
          </select>
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option>All Types</option>
            <option>Lecture</option>
            <option>Lab</option>
            <option>Tutorial</option>
            <option>Workshop</option>
          </select>
        </CardContent>
      </Card>

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subject List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Code
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Subject Name
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Instructor
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Campus
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Cohort
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Students
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Credits
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr
                    key={subject.code}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="p-3 text-sm font-medium text-foreground">
                      {subject.code}
                    </td>
                    <td className="p-3 text-sm text-foreground">
                      {subject.name}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          typeColors[subject.type]
                        }`}
                      >
                        {subject.type}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {subject.instructor}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {subject.campus}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {subject.cohort}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {subject.students}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {subject.credits}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
