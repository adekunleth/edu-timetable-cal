import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown } from "lucide-react";

export default function Reports() {
  const metrics = [
    {
      title: "Room Utilization",
      value: "78%",
      change: "+5%",
      trend: "up",
    },
    {
      title: "Instructor Load",
      value: "18hrs",
      change: "avg/week",
      trend: "neutral",
    },
    {
      title: "Attendance Compliance",
      value: "87%",
      change: "-2%",
      trend: "down",
    },
    {
      title: "Schedule Conflicts",
      value: "3",
      change: "this week",
      trend: "down",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Reports & Analytics
          </h2>
          <p className="text-muted-foreground">
            Track performance and compliance metrics
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export All Reports
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-foreground">
                  {metric.value}
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    metric.trend === "up"
                      ? "text-present"
                      : metric.trend === "down"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {metric.trend === "up" && (
                    <TrendingUp className="h-4 w-4" />
                  )}
                  {metric.trend === "down" && (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>{metric.change}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Categories */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Weekly Attendance Summary
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Student Attendance by Cohort
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Low Attendance Alerts
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Compliance Report (CRICOS)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Room Utilization Analysis
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Instructor Teaching Load
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Conflict Detection Log
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Class Cancellations Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Subject Enrollment Statistics
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Delivery Mode Breakdown
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Campus Activity Overview
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Academic Year Summary
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Create Custom Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Saved Report Templates
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Schedule Automated Reports
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Export to External Systems
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
