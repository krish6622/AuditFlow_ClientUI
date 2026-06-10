import { Contact } from "lucide-react";

import { ComingSoon } from "@/components/common/ComingSoon";

export default function CustomersPage() {
  return (
    <ComingSoon
      title="Customers"
      description="Manage customer contacts, addresses, and GST details in one place."
      icon={Contact}
    />
  );
}
