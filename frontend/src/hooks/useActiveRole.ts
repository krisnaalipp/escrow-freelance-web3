"use client";

import { useCallback, useEffect, useState } from "react";

export type ActiveRole = "Client" | "Freelancer";

const ROLE_STORAGE_KEY = "active-role-v1";
const ROLE_EVENT = "active-role-changed";

function getInitialRole(): ActiveRole {
  if (typeof window === "undefined") {
    return "Client";
  }

  const savedRole = window.localStorage.getItem(ROLE_STORAGE_KEY);
  return savedRole === "Freelancer" ? "Freelancer" : "Client";
}

export function useActiveRole() {
  const [activeRole, setActiveRoleState] = useState<ActiveRole>(getInitialRole);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== ROLE_STORAGE_KEY || !event.newValue) {
        return;
      }

      if (event.newValue === "Client" || event.newValue === "Freelancer") {
        setActiveRoleState(event.newValue);
      }
    };

    const onRoleEvent = () => {
      const latest = window.localStorage.getItem(ROLE_STORAGE_KEY);

      if (latest === "Client" || latest === "Freelancer") {
        setActiveRoleState(latest);
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(ROLE_EVENT, onRoleEvent);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(ROLE_EVENT, onRoleEvent);
    };
  }, []);

  const setActiveRole = useCallback((nextRole: ActiveRole) => {
    setActiveRoleState(nextRole);
    window.localStorage.setItem(ROLE_STORAGE_KEY, nextRole);
    window.dispatchEvent(new CustomEvent(ROLE_EVENT));
  }, []);

  return {
    activeRole,
    isClient: activeRole === "Client",
    isFreelancer: activeRole === "Freelancer",
    setActiveRole,
  };
}
