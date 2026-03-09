const skippedCustomerNames = new Set([
  "BD Fees",
  "BD SP 3",
  "BD SPLIT",
  "Revenue Share",
  "DollarT-UNIFIED",
  "FamilyD-UNIFIED",
]);

const customerNameAliases = new Map([["Wal-Mart", "Walmart"]]);
const ownerAliases = new Map([["Chasity", "Chas"]]);

type SupplierOwnerSummaryInput = {
  eamDisplayName: string | null;
  eamUserId: string | null;
};

export type SupplierOwnerSummary = {
  label: string;
  ownerUserId: string | null;
  state: "single" | "multiple" | "unassigned";
};

export function normalizeCustomerName(sourceCustomerName: string) {
  const trimmed = sourceCustomerName.trim();
  const canonicalName = customerNameAliases.get(trimmed) ?? trimmed;

  return {
    sourceCustomerName: trimmed,
    canonicalName,
    isSkipped: skippedCustomerNames.has(canonicalName),
  };
}

export function normalizeAssignmentOwnerName(ownerName: string | null | undefined) {
  const trimmed = ownerName?.trim();
  if (!trimmed) {
    return null;
  }

  return ownerAliases.get(trimmed) ?? trimmed;
}

export function deriveSupplierOwnerSummary(
  accounts: SupplierOwnerSummaryInput[],
  fallbackOwnerName: string | null,
  fallbackOwnerUserId: string | null
): SupplierOwnerSummary {
  const distinctOwners = new Map<string, string>();

  for (const account of accounts) {
    if (account.eamUserId && account.eamDisplayName) {
      distinctOwners.set(account.eamUserId, account.eamDisplayName);
    }
  }

  if (distinctOwners.size === 1) {
    const [ownerUserId, label] = Array.from(distinctOwners.entries())[0];
    return { label, ownerUserId, state: "single" };
  }

  if (distinctOwners.size > 1) {
    return { label: "Multiple owners", ownerUserId: null, state: "multiple" };
  }

  if (fallbackOwnerName) {
    return { label: fallbackOwnerName, ownerUserId: fallbackOwnerUserId, state: "single" };
  }

  return { label: "Unassigned", ownerUserId: null, state: "unassigned" };
}
