import { ShieldX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Forbidden() {
  return (
    <div className="flex flex-col h-full items-center justify-center bg-background px-6">
      <Card className="w-full max-w-md border-destructive/20 text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>

          <CardTitle className="text-3xl font-bold">403</CardTitle>
          <CardDescription className="text-base">
            Forbidden
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
