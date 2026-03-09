// Generated from:
// - /Users/bryce/Desktop/CSC Supplier List.xlsx
// - /Users/bryce/Desktop/Who Works on Which Suppliers at What Retailers (and with Which Support People).xlsx
// Regenerate with: python3 scripts/build_csc_supplier_seed.py

export type CscSupplierAssignmentSeed = {
  eam: string;
  supplier: string;
  customerName: string;
  spm: string | null;
};

export const cscSupplierMasterNames = [
  "AdTech",
  "AO - American Oak",
  "Beadsmith",
  "Collage Crafts",
  "CoreTrex",
  "DanDee",
  "Deco Art",
  "Demis (Unified)",
  "EcoSource",
  "Everything Mary",
  "Fashion Angels",
  "Federal Foam",
  "Foss",
  "Fun Kingdom",
  "Ginsey",
  "Jacquard",
  "Mezzimatic",
  "MGR Design",
  "Milan Pacific",
  "NeedleArt",
  "Northcott",
  "Olfa",
  "Pepperell Braiding",
  "Royal Talens",
  "Scentsy",
  "SewGroup - HTL",
  "Silver Creek Leather",
  "Uchida",
  "US Shell",
  "We Cool Toys"
] as const;

export const cscSupplierAssignmentSeeds: readonly CscSupplierAssignmentSeed[] = [
  {
    "eam": "Bob",
    "supplier": "Trend Glass",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Bob",
    "supplier": "Trend Glass",
    "customerName": "Wal-Mart",
    "spm": null
  },
  {
    "eam": "Bob",
    "supplier": "Federal Foam",
    "customerName": "Wal-Mart",
    "spm": null
  },
  {
    "eam": "Chasity",
    "supplier": "EcoSource",
    "customerName": "Sam's",
    "spm": "Heather"
  },
  {
    "eam": "Chasity",
    "supplier": "Fashion Angels",
    "customerName": "Sam's",
    "spm": "Heather"
  },
  {
    "eam": "Chasity",
    "supplier": "Pin Club",
    "customerName": "Wal-Mart",
    "spm": "Heather"
  },
  {
    "eam": "Chasity",
    "supplier": "Fashion Angels",
    "customerName": "Wal-Mart",
    "spm": "Heather"
  },
  {
    "eam": "Sandy",
    "supplier": "Blue Sky",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "Federal Foam",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "Jacquard",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "Mezzimatic",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "Milan Pacific",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "Olfa",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "Royal Talens",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "We Cool Toys",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "NeedleArt",
    "customerName": "Sam's",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "Milan Pacific",
    "customerName": "Wal-Mart",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "Silver Creek Leather",
    "customerName": "Wal-Mart",
    "spm": null
  },
  {
    "eam": "Ragan",
    "supplier": "AdTech",
    "customerName": "Wal-Mart",
    "spm": "Stacie"
  },
  {
    "eam": "Ragan",
    "supplier": "Ginsey",
    "customerName": "Michaels",
    "spm": "Stacie"
  },
  {
    "eam": "Ragan",
    "supplier": "EcoSource",
    "customerName": "Michaels",
    "spm": "Stacie"
  },
  {
    "eam": "Ragan",
    "supplier": "Fashion Angels",
    "customerName": "Michaels",
    "spm": "Stacie"
  },
  {
    "eam": "Ragan",
    "supplier": "Jacquard",
    "customerName": "Michaels",
    "spm": "Stacie"
  },
  {
    "eam": "Ragan",
    "supplier": "NeedleArt",
    "customerName": "Michaels",
    "spm": "Stacie"
  },
  {
    "eam": "Ragan",
    "supplier": "Mezzimatic",
    "customerName": "Michaels",
    "spm": "Stacie"
  },
  {
    "eam": "Clint",
    "supplier": "CoreTrex",
    "customerName": "Revenue Share",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "Olfa",
    "customerName": "BD Fees",
    "spm": null
  },
  {
    "eam": "Melanie",
    "supplier": "Olfa",
    "customerName": "BD SPLIT",
    "spm": "Kasandra"
  },
  {
    "eam": "Bob",
    "supplier": "Scentsy",
    "customerName": "BD Fees",
    "spm": null
  },
  {
    "eam": "Ragan",
    "supplier": "Scentsy",
    "customerName": "BD SPLIT",
    "spm": "Stacie"
  },
  {
    "eam": "Melanie",
    "supplier": "Everything Mary",
    "customerName": "Michaels",
    "spm": "Kasandra"
  },
  {
    "eam": "Bob",
    "supplier": "Trend Glass",
    "customerName": "BD Fees",
    "spm": null
  },
  {
    "eam": "Chasity",
    "supplier": "EcoSource",
    "customerName": "Wal-Mart",
    "spm": "Heather"
  },
  {
    "eam": "Ragan",
    "supplier": "AO - American Oak",
    "customerName": "Dollar General",
    "spm": "Stacie"
  },
  {
    "eam": "Ragan",
    "supplier": "AdTech",
    "customerName": "Michaels",
    "spm": "Stacie"
  },
  {
    "eam": "Melanie",
    "supplier": "Fun Kingdom",
    "customerName": "Michaels",
    "spm": "Kasandra"
  },
  {
    "eam": "Clint",
    "supplier": "AdTech",
    "customerName": "Family Dollar",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "Fun Kingdom",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Melanie",
    "supplier": "Pepperell Braiding",
    "customerName": "Dollar General",
    "spm": "Kasandra"
  },
  {
    "eam": "Melanie",
    "supplier": "Silver Creek Leather",
    "customerName": "Michaels",
    "spm": "Kasandra"
  },
  {
    "eam": "Ragan",
    "supplier": "AO - American Oak",
    "customerName": "Hobby Lobby",
    "spm": "Stacie"
  },
  {
    "eam": "Melanie",
    "supplier": "Pepperell Braiding",
    "customerName": "Michaels",
    "spm": "Kasandra"
  },
  {
    "eam": "Melanie",
    "supplier": "Beadsmith",
    "customerName": "Michaels",
    "spm": "Kasandra"
  },
  {
    "eam": "Melanie",
    "supplier": "Silver Creek Leather",
    "customerName": "The Beadsmith",
    "spm": "Kasandra"
  },
  {
    "eam": "Ragan",
    "supplier": "We Cool Toys",
    "customerName": "Michaels",
    "spm": "Stacie"
  },
  {
    "eam": "Ragan",
    "supplier": "Mezzimatic",
    "customerName": "Dollar General",
    "spm": "Stacie"
  },
  {
    "eam": "Sandy",
    "supplier": "Uchida",
    "customerName": "Mardel",
    "spm": null
  },
  {
    "eam": "Ragan",
    "supplier": "Uchida",
    "customerName": "Dollar General",
    "spm": "Stacie"
  },
  {
    "eam": "Chasity",
    "supplier": "Everything Mary",
    "customerName": "Wal-Mart",
    "spm": "Heather"
  },
  {
    "eam": "Bob",
    "supplier": "Everything Mary",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Bob",
    "supplier": "US Shell",
    "customerName": "Wal-Mart",
    "spm": null
  },
  {
    "eam": "Ragan",
    "supplier": "Demis (Unified)",
    "customerName": "Michaels",
    "spm": "Stacie"
  },
  {
    "eam": "Sandy",
    "supplier": "US Shell",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "DanDee",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Bob",
    "supplier": "MGR Design",
    "customerName": "Wal-Mart",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "MGR Design",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Bob",
    "supplier": "Foss",
    "customerName": "Wal-Mart",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "Lion Brand Yarns",
    "customerName": "BD Fees",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "Silver Creek Leather",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "AdTech",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Ragan",
    "supplier": "Demis (Unified)",
    "customerName": "Wal-Mart",
    "spm": "Stacie"
  },
  {
    "eam": "Sandy",
    "supplier": "Lion Brand Yarns",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "NeedleArt",
    "customerName": "Wal-Mart",
    "spm": null
  },
  {
    "eam": "Ragan",
    "supplier": "AO - American Oak",
    "customerName": "Target",
    "spm": "Stacie"
  },
  {
    "eam": "Ragan",
    "supplier": "We Cool Toys",
    "customerName": "HEB",
    "spm": "Stacie"
  },
  {
    "eam": "Sandy",
    "supplier": "SewGroup - HTL",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Melanie",
    "supplier": "SewGroup - HTL",
    "customerName": "Wal-Mart",
    "spm": "Kasandra"
  },
  {
    "eam": "UNIFIED",
    "supplier": "AdTech",
    "customerName": "FamilyD-UNIFIED",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "Blue Sky",
    "customerName": "BD Fees",
    "spm": null
  },
  {
    "eam": "Melanie",
    "supplier": "Collage Crafts",
    "customerName": "BD Fees",
    "spm": "Kasandra"
  },
  {
    "eam": "Ragan",
    "supplier": "We Cool Toys",
    "customerName": "Dollar General",
    "spm": "Stacie"
  },
  {
    "eam": "Melanie",
    "supplier": "Blue Sky",
    "customerName": "BD SPLIT",
    "spm": "Kasandra"
  },
  {
    "eam": "Melanie",
    "supplier": "Northcott",
    "customerName": "Michaels",
    "spm": "Kasandra"
  },
  {
    "eam": "Sandy",
    "supplier": "Northcott",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Ragan",
    "supplier": "US Shell",
    "customerName": "Michaels",
    "spm": "Stacie"
  },
  {
    "eam": "Ragan",
    "supplier": "AdTech",
    "customerName": "Dollar General",
    "spm": "Stacie"
  },
  {
    "eam": "Ragan",
    "supplier": "Ginsey",
    "customerName": "BD Fees",
    "spm": "Stacie"
  },
  {
    "eam": "Melanie",
    "supplier": "Collage Crafts",
    "customerName": "Michaels",
    "spm": "Kasandra"
  },
  {
    "eam": "Sandy",
    "supplier": "Demis (Unified)",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Chasity",
    "supplier": "Pin Club",
    "customerName": "BD Fees",
    "spm": "Heather"
  },
  {
    "eam": "Melanie",
    "supplier": "Deco Art",
    "customerName": "Dollar General",
    "spm": "Kasandra"
  },
  {
    "eam": "Sandy",
    "supplier": "Uchida",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Ragan",
    "supplier": "AO - American Oak",
    "customerName": "At Home",
    "spm": "Stacie"
  },
  {
    "eam": "Melanie",
    "supplier": "Deco Art",
    "customerName": "Michaels",
    "spm": "Kasandra"
  },
  {
    "eam": "Ragan",
    "supplier": "Uchida",
    "customerName": "Michaels",
    "spm": "Stacie"
  },
  {
    "eam": "Chasity",
    "supplier": "Uchida",
    "customerName": "Wal-Mart",
    "spm": "Heather"
  },
  {
    "eam": "Ragan",
    "supplier": "AO - American Oak",
    "customerName": "Michaels",
    "spm": "Stacie"
  },
  {
    "eam": "Ragan",
    "supplier": "AO - American Oak",
    "customerName": "Wal-Mart",
    "spm": "Stacie"
  },
  {
    "eam": "Sandy",
    "supplier": "Foss",
    "customerName": "BD SPLIT",
    "spm": null
  },
  {
    "eam": "Ragan",
    "supplier": "Foss",
    "customerName": "BD Fees",
    "spm": "Stacie"
  },
  {
    "eam": "Sandy",
    "supplier": "EcoSource",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Bob",
    "supplier": "Federal Foam",
    "customerName": "BD Fees",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "Federal Foam",
    "customerName": "BD SPLIT",
    "spm": null
  },
  {
    "eam": "Melanie",
    "supplier": "Federal Foam",
    "customerName": "BD SP 3",
    "spm": "Kasandra"
  },
  {
    "eam": "Ragan",
    "supplier": "AO - American Oak",
    "customerName": "Williams Sonoma",
    "spm": "Stacie"
  },
  {
    "eam": "Chasity",
    "supplier": "Fashion Angels",
    "customerName": "BD Fees",
    "spm": "Heather"
  },
  {
    "eam": "Ragan",
    "supplier": "Fashion Angels",
    "customerName": "BD SPLIT",
    "spm": "Stacie"
  },
  {
    "eam": "Sandy",
    "supplier": "Jacquard",
    "customerName": "BD Fees",
    "spm": null
  },
  {
    "eam": "Ragan",
    "supplier": "Jacquard",
    "customerName": "BD SPLIT",
    "spm": "Stacie"
  },
  {
    "eam": "Clint",
    "supplier": "AdTech",
    "customerName": "Dollar Tree",
    "spm": null
  },
  {
    "eam": "UNIFIED",
    "supplier": "AdTech",
    "customerName": "DollarT-UNIFIED",
    "spm": null
  },
  {
    "eam": "Sandy",
    "supplier": "Milan Pacific",
    "customerName": "BD Fees",
    "spm": null
  },
  {
    "eam": "Melanie",
    "supplier": "Royal Talens",
    "customerName": "BD Fees",
    "spm": "Kasandra"
  },
  {
    "eam": "Sandy",
    "supplier": "Royal Talens",
    "customerName": "BD SPLIT",
    "spm": null
  },
  {
    "eam": "Ragan",
    "supplier": "Royal Talens",
    "customerName": "BD SP 3",
    "spm": "Stacie"
  },
  {
    "eam": "Sandy",
    "supplier": "Scentsy",
    "customerName": "Hobby Lobby",
    "spm": null
  },
  {
    "eam": "Bob",
    "supplier": "Scentsy",
    "customerName": "Wal-Mart",
    "spm": null
  },
  {
    "eam": "Ragan",
    "supplier": "Scentsy",
    "customerName": "Michaels",
    "spm": "Stacie"
  },
  {
    "eam": "Ragan",
    "supplier": "NeedleArt",
    "customerName": "Target",
    "spm": "Stacie"
  },
  {
    "eam": "Ragan",
    "supplier": "Uchida",
    "customerName": "Target",
    "spm": "Stacie"
  },
  {
    "eam": "Ragan",
    "supplier": "Royal Talens",
    "customerName": "Target",
    "spm": "Stacie"
  },
  {
    "eam": "Ragan",
    "supplier": "Scentsy",
    "customerName": "Target",
    "spm": "Stacie"
  },
  {
    "eam": "Ragan",
    "supplier": "Jacquard",
    "customerName": "Wal-Mart",
    "spm": "Stacie"
  },
  {
    "eam": "Melanie",
    "supplier": "Federal Foam",
    "customerName": "Michaels",
    "spm": "Kasandra"
  },
  {
    "eam": "Melanie",
    "supplier": "SewGroup - HTL",
    "customerName": "Michaels",
    "spm": "Kasandra"
  },
  {
    "eam": "Melanie",
    "supplier": "Olfa",
    "customerName": "Michaels",
    "spm": "Kasandra"
  },
  {
    "eam": "Melanie",
    "supplier": "Beadsmith",
    "customerName": "Wal-Mart",
    "spm": "Kasandra"
  },
  {
    "eam": "Melanie",
    "supplier": "Deco Art",
    "customerName": "Wal-Mart",
    "spm": "Kasandra"
  },
  {
    "eam": "Melanie",
    "supplier": "Northcott",
    "customerName": "Wal-Mart",
    "spm": "Kasandra"
  },
  {
    "eam": "Melanie",
    "supplier": "Olfa",
    "customerName": "Wal-Mart",
    "spm": "Kasandra"
  },
  {
    "eam": "Melanie",
    "supplier": "Royal Talens",
    "customerName": "Wal-Mart",
    "spm": "Kasandra"
  },
  {
    "eam": "Ragan",
    "supplier": "Fashion Angels",
    "customerName": "Dollar General",
    "spm": "Stacie"
  },
  {
    "eam": "Ragan",
    "supplier": "NeedleArt",
    "customerName": "Dollar General",
    "spm": "Stacie"
  },
  {
    "eam": "Chasity",
    "supplier": "Milan Pacific",
    "customerName": "BD SPLIT",
    "spm": "Heather"
  },
  {
    "eam": "Melanie",
    "supplier": "Milan Pacific",
    "customerName": "BD SP 3",
    "spm": "Kasandra"
  },
  {
    "eam": "Clint",
    "supplier": "SewGroup - HTL",
    "customerName": "Dollar Tree",
    "spm": null
  },
  {
    "eam": "UNIFIED",
    "supplier": "SewGroup - HTL",
    "customerName": "DollarT-UNIFIED",
    "spm": null
  }
] as const;
