"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { useUser } from "@/context/auth-context";
import { errorMessage } from "@/lib/api";
import { ROLE_TABS, listMembers, type TeamMember } from "@/lib/team";
import type { Role } from "@/lib/types";
import { useQuery } from "@/lib/use-query";
import { CreateMemberForm } from "./create-member-form";
import { CredentialsCard } from "./credentials-card";
import { TeamTable } from "./team-table";

export function TeamView() {
  const user = useUser();
  const [role, setRole] = useState<Role>("AGENT");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [created, setCreated] = useState<{ member: TeamMember; password: string } | null>(null);

  const { data, error, loading, refetch } = useQuery((signal) => listMembers(role, page, signal), [role, page]);

  function changeRole(next: Role) {
    setRole(next);
    setPage(1);
  }

  function handleCreated(member: TeamMember, password: string) {
    setCreated({ member, password });
    setShowForm(false);
    // show the new account: switch to its tab, or reload the current one
    if (role !== member.role) changeRole(member.role);
    else if (page !== 1) setPage(1);
    else refetch();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Team</h1>
          <p className="mt-1 text-sm text-slate-500">People in your store and who can do what.</p>
        </div>
        {!showForm ? <Button onClick={() => setShowForm(true)}>Add team member</Button> : null}
      </div>

      {created ? <CredentialsCard member={created.member} password={created.password} onDismiss={() => setCreated(null)} /> : null}

      {showForm ? <CreateMemberForm onCreated={handleCreated} onCancel={() => setShowForm(false)} /> : null}

      <Tabs label="Show" value={role} options={ROLE_TABS} onChange={changeRole} />

      {error ? (
        <Alert>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{errorMessage(error)}</span>
            <Button variant="secondary" onClick={refetch}>
              Retry
            </Button>
          </div>
        </Alert>
      ) : null}

      {loading && !data ? (
        <div className="space-y-2" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : null}

      {data && data.items.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <p className="font-medium text-slate-900">
            {role === "CUSTOMER" ? "No customers yet" : `No ${role === "AGENT" ? "agents" : "admins"} yet`}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {role === "CUSTOMER" ? "Customers appear here after they sign up with your store ID." : "Use Add team member to create one."}
          </p>
        </div>
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <TeamTable items={data.items} meId={user.id} loading={loading} />
          <Pagination page={data.page} totalPages={data.totalPages} onPage={setPage} />
        </>
      ) : null}
    </div>
  );
}