import { Settings } from "lucide-react";

import { ComingSoon } from "@/components/common/ComingSoon";

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      description="Manage your organization preferences and configuration."
      icon={Settings}
    />
  );
}
