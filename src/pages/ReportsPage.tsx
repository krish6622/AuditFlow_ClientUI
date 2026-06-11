import { PieChart } from "lucide-react";

import { ComingSoon } from "@/components/common/ComingSoon";

export default function ReportsPage() {
  return (
    <ComingSoon
      title="Reports"
      description="Financial and operational insights across your firm."
      icon={PieChart}
    />
  );
}
