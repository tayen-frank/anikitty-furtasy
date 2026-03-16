"use client";

import { useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    setIsSubmitting(true);

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
    } finally {
      router.replace("/admin" as Route);
      router.refresh();
      setIsSubmitting(false);
    }
  };

  return (
    <Button variant="ghost" onClick={handleLogout} disabled={isSubmitting}>
      {isSubmitting ? "Signing Out..." : "Sign Out"}
    </Button>
  );
}
