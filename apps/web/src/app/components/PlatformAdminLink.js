"use client";

import { usePathname, useRouter } from "next/navigation";
import DashboardNavIcon from "./DashboardNavIcon";

export default function PlatformAdminLink() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="platform-admin-nav" style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #e2e9f2" }}>
      <button
        className={`side-link ${pathname === "/admin" ? "active" : ""}`}
        type="button"
        onClick={() => router.push("/admin")}
        style={{ width: "100%" }}
        aria-current={pathname === "/admin" ? "page" : undefined}
      >
        <DashboardNavIcon name="admin" size={24} />
        <span>Platform Admin</span>
      </button>
    </div>
  );
}
