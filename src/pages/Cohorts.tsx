import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

export default function Cohorts() {
  const cohorts = [
    {
      name: "Nursing 2025",
      program: "Bachelor of Nursing",
      students: 45,
      campus: "Sydney Campus",
      intake: "February 2025",
      subjects: ["BIO101", "CHEM101", "NURS101"],
    },
    {
      name: "Science 2024",
      program: "Bachelor of Science",
      students: 32,
      campus: "Sydney Campus",
      intake: "February 2024",
      subjects: ["CHEM202", "BIO201", "MATH201"],
    },
    {
      name: "Engineering 2023",
      program: "Bachelor of Engineering",
      students: 28,
      campus: "Melbourne Campus",
      intake: "February 2023",
      subjects: ["MATH301", "PHYS301", "ENG301"],
    },
    {
      name: "Physics 2024",
      program: "Bachelor of Physics",
      students: 38,
      campus: "Sydney Campus",
      intake: "July 2024",
      subjects: ["PHYS202", "MATH202", "CHEM201"],
    },
    {
      name: "Computer Science 2023",
      program: "Bachelor of Computer Science",
      students: 25,
      campus: "Melbourne Campus",
      intake: "February 2023",
      subjects: ["CS401", "MATH401", "ENG401"],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Cohorts & Groups
          </h2>
          <p className="text-muted-foreground">
            Manage student cohorts and intake groups
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Cohort
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex gap-4 p-4">
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option>All Programs</option>
            <option>Bachelor of Nursing</option>
            <option>Bachelor of Science</option>
            <option>Bachelor of Engineering</option>
          </select>
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option>All Campuses</option>
            <option>Sydney Campus</option>
            <option>Melbourne Campus</option>
          </select>
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option>All Intakes</option>
            <option>February 2025</option>
            <option>July 2024</option>
            <option>February 2024</option>
          </select>
        </CardContent>
      </Card>

      {/* Cohorts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cohorts.map((cohort, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{cohort.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {cohort.program}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-lg font-semibold text-foreground">
                    {cohort.students}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subjects</p>
                  <p className="text-lg font-semibold text-foreground">
                    {cohort.subjects.length}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Campus</p>
                <p className="text-sm font-medium text-foreground">
                  {cohort.campus}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Intake Period</p>
                <p className="text-sm font-medium text-foreground">
                  {cohort.intake}
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm text-muted-foreground">
                  Enrolled Subjects
                </p>
                <div className="flex flex-wrap gap-2">
                  {cohort.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
