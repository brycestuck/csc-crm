#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET


NS = {
    "a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "pr": "http://schemas.openxmlformats.org/package/2006/relationships",
}
REL_NS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"


def read_first_sheet(path: Path) -> list[list[str]]:
    with ZipFile(path) as archive:
        rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        rel_map = {
            rel.attrib["Id"]: rel.attrib["Target"]
            for rel in rels.findall("pr:Relationship", NS)
        }

        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        sheets = workbook.find("a:sheets", NS)
        if sheets is None or not list(sheets):
            return []

        first_sheet = list(sheets)[0]
        target = rel_map[first_sheet.attrib[REL_NS]]
        if not target.startswith("xl/"):
            target = f"xl/{target.lstrip('/')}"

        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            for item in shared.findall("a:si", NS):
                shared_strings.append("".join(text.text or "" for text in item.findall(".//a:t", NS)))

        sheet = ET.fromstring(archive.read(target))
        rows: list[list[str]] = []

        for row in sheet.findall("a:sheetData/a:row", NS):
            values: list[str] = []
            for cell in row.findall("a:c", NS):
                raw_value = cell.find("a:v", NS)
                inline_value = cell.find("a:is", NS)
                cell_type = cell.attrib.get("t")

                if raw_value is not None and raw_value.text is not None:
                    value = shared_strings[int(raw_value.text)] if cell_type == "s" else raw_value.text
                elif inline_value is not None:
                    value = "".join(text.text or "" for text in inline_value.findall(".//a:t", NS))
                else:
                    value = ""

                values.append(value.strip())

            rows.append(values)

        return rows


def build_module(master_path: Path, assignments_path: Path) -> str:
    master_rows = read_first_sheet(master_path)
    assignment_rows = read_first_sheet(assignments_path)

    master_names = [row[0] for row in master_rows[1:] if row and row[0]]
    header = assignment_rows[0]

    normalized_rows = []
    for row in assignment_rows[1:]:
      if not any(row):
        continue
      padded = row + [""] * max(0, len(header) - len(row))
      normalized_rows.append(
          {
              "eam": padded[0],
              "supplier": padded[1],
              "customerName": padded[2],
              "spm": padded[3] or None,
          }
      )

    supplier_json = json.dumps(master_names, indent=2, ensure_ascii=True)
    assignments_json = json.dumps(normalized_rows, indent=2, ensure_ascii=True)

    return f"""// Generated from:
// - {master_path}
// - {assignments_path}
// Regenerate with: python3 scripts/build_csc_supplier_seed.py

export type CscSupplierAssignmentSeed = {{
  eam: string;
  supplier: string;
  customerName: string;
  spm: string | null;
}};

export const cscSupplierMasterNames = {supplier_json} as const;

export const cscSupplierAssignmentSeeds: readonly CscSupplierAssignmentSeed[] = {assignments_json} as const;
"""


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate static CSC supplier seed data from the two workbook sources.")
    parser.add_argument(
        "--master",
        default="/Users/bryce/Desktop/CSC Supplier List.xlsx",
        help="Path to CSC Supplier List.xlsx",
    )
    parser.add_argument(
        "--assignments",
        default="/Users/bryce/Desktop/Who Works on Which Suppliers at What Retailers (and with Which Support People).xlsx",
        help="Path to the CSC supplier assignment workbook",
    )
    parser.add_argument(
        "--out",
        default="/Users/bryce/Documents/New project/creative-sales-crm/src/lib/imports/csc-supplier-seed.ts",
        help="Output TypeScript module path",
    )
    args = parser.parse_args()

    module_text = build_module(Path(args.master), Path(args.assignments))
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(module_text, encoding="utf-8")


if __name__ == "__main__":
    main()
