"use client";

import { useMemo, useState } from "react";

import { WORKFLOW_ROLES } from "../../data/landing";
import SectionHeading from "./SectionHeading";

export default function WorkflowSection() {
  const [activeRole, setActiveRole] = useState(WORKFLOW_ROLES[0].id);

  const selectedRole = useMemo(
    () => WORKFLOW_ROLES.find((role) => role.id === activeRole) ?? WORKFLOW_ROLES[0],
    [activeRole],
  );

  return (
    <section id="workflow" className="section-dark !pt-0">
      <div className="app-container">
        <SectionHeading
          eyebrow="Escrow Workflow"
          title="A clear flow for every role"
          description="Switch between perspectives to understand how both sides move from agreement to payout."
        />

        <div className="reveal-up reveal-delay-1 mb-8 flex flex-wrap gap-3">
          {WORKFLOW_ROLES.map((role) => {
            const isActive = role.id === selectedRole.id;

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setActiveRole(role.id)}
                className={isActive ? "chip chip-active" : "chip"}
              >
                {role.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {selectedRole.steps.map((step, index) => (
            <article
              key={step.title}
              className={`surface-card reveal-up rounded-2xl p-7 reveal-delay-${Math.min(index + 1, 4)}`}
            >
              <p className="mb-2 text-sm font-semibold text-cyan-300">
                Step {index + 1}
              </p>
              <h3 className="text-primary mb-3 text-xl font-semibold">{step.title}</h3>
              <p className="text-secondary text-sm">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
