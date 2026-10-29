import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { APIPublicTrainingProgramSection } from "@/data/trainings";

export function ProgramCard({ program }: { program: APIPublicTrainingProgramSection[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Programme</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue={program[0]?.title}>
          {program.map((section) => (
            <AccordionItem key={section.title} value={section.title}>
              <AccordionTrigger>{section.title}</AccordionTrigger>
              <AccordionContent>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {section.items.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
