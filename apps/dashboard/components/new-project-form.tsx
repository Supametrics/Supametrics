"use client";
import { useState } from "react";
import { useSession } from "@/store/use-session";
import { useCreateProject } from "@/hooks/use-create-project";
import { LoadingSpinner } from "@repo/ui/components/loading-spinner";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@repo/ui/components/ui/select";

export const NewProjectForm = () => {
  const { user, isLoading } = useSession();
  const { mutate: createProject, isPending } = useCreateProject();

  const [teamId, setTeamId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [url, setUrl] = useState("");

  const personalWorkspace = {
    id: "personal", // fixed id
    name: "My Workspace",
    logo: {
      src: `https://avatar.vercel.sh/${user?.email}`,
      alt: "My Workspace",
    },
    subscriptionType: user?.subscriptionType,
    isPersonal: true,
  };
  const mappedTeams =
    user?.teams?.map((t) => {
      const team = t.team;

      return {
        id: team.uuid,
        name: team.name,
        logo: {
          src: `https://avatar.vercel.sh/${team.uuid}`,
          alt: team.name,
        },
        subscriptionType: user.subscriptionType ?? "Free", // comes from user, not inside team
        role: t.role,
        isPersonal: false,
      };
    }) ?? [];

  const teams = [personalWorkspace, ...mappedTeams];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: {
      name: string;
      type: string;
      url: string;
      teamId?: string;
    } = { name, type, url };

    if (teamId && teamId !== "personal") {
      payload.teamId = teamId;
    }

    createProject(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <LoadingSpinner loading={isLoading} />
      </div>
    );
  }

  if (!user) {
    return <p className="p-10">No session found</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center md:px-4 py-10"
    >
      <Card className="w-full max-w-lg md:w-[700px] text-sm">
        <CardContent>
          <CardTitle className="text-lg md:text-2xl">New Project</CardTitle>
          <CardDescription className="mb-5">
            Define your project with team, name and URL.
          </CardDescription>

          {/* Team field */}
          <div className="space-y-3 mb-4">
            <Label className="text-sm font-medium">Team</Label>
            <Select onValueChange={setTeamId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project Name */}
          <div className="space-y-3 mb-4">
            <Label className="text-sm font-medium">Project Name</Label>
            <Input
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Project Type */}
          <div className="space-y-3 mb-4">
            <Label className="text-sm font-medium">Project Type</Label>
            <Select onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Project URL */}
          <div className="space-y-3 mb-4">
            <Label className="text-sm font-medium">Project URL</Label>
            <Input
              placeholder="https://project-site.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mb-3"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <LoadingSpinner loading={isPending} />
            ) : (
              "Create Project"
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};
