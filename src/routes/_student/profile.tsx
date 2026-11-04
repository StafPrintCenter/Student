import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE } from "@/data/site";
import { useStudentAuth } from "@/hooks/useStudentAuth";

export const Route = createFileRoute("/_student/profile")({
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Mon profil | ${SITE.name}` },
      {
        name: "description",
        content: `Consultez les informations de votre compte apprenant ${SITE.name}.`,
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useStudentAuth();
  const initials = `${user?.firstName.charAt(0) ?? ""}${user?.lastName.charAt(0) ?? ""}`
    .toUpperCase() || "?";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compte"
        title="Mon profil"
        description="Les informations associées à votre compte apprenant."
      />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <Avatar className="h-24 w-24">
              {user?.photo && <AvatarImage src={user.photo} alt={user.name} />}
              <AvatarFallback className="bg-primary/15 text-2xl text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.fullname || user?.name || "Profil apprenant"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <ProfileField label="Prénom" value={user?.firstName} />
            <ProfileField label="Nom" value={user?.lastName} />
            <ProfileField label="E-mail" value={user?.email} />
            <ProfileField label="Téléphone" value={user?.phone} />
            <ProfileField label="Date de naissance" value={user?.birthDate} />
            <ProfileField label="Adresse" value={user?.address} />
            <ProfileField label="Occupation" value={user?.occupation} />
            <ProfileField label="Biographie" value={user?.bio} className="sm:col-span-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  className,
}: {
  label: string;
  value: string | null | undefined;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="min-h-5 break-words text-sm">{value?.trim() || "Non renseigné"}</p>
    </div>
  );
}
