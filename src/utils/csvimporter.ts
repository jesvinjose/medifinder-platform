import fs from "fs/promises";
import csvParser from "csv-parser";
import { GenericMedicine } from "../models/GenericMedicine.js";
import { BrandedMedicine } from "../models/BrandedMedicine.js";

export const importCSV = async (
  csvFilePath: string,
  type: "generic" | "branded"
) => {
  console.log("✅ Connected to MongoDB");

  const results: any[] = [];

  const stream = await fs.open(csvFilePath).then((f) => f.createReadStream());

  await new Promise<void>((resolve, reject) => {
    stream
      .pipe(csvParser())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", resolve)
      .on("error", reject);
  });

  for (const item of results) {
    try {
      if (type === "generic") {
        const {
          "Generic Name": name,
          "Unit Size": packing,
          MRP,
          "Group Name": group_name,
          "Drug Code": drug_code,
        } = item;

        if (!name) continue;

        await GenericMedicine.updateOne(
          { name: name.trim() },
          {
            $set: {
              packing: packing?.trim(),
              mrp: parseFloat(MRP),
              group_name,
              jan_aushadhi_code: drug_code,
              last_updated: new Date(),
            },
          },
          { upsert: true }
        );
      }

      if (type === "branded") {
        const {
          "Brand Name": brand_name,
          "Generic Name": generic_name,
          Company: company,
          Packing: packing,
          "PTR (Per Unit)": price_to_retailer,
          MRP,
        } = item;

        if (!brand_name || !generic_name) continue;

        const generic = await GenericMedicine.findOne({
          name: new RegExp(`^${generic_name.trim()}$`, "i"),
        });

        if (!generic) {
          console.warn(
            `⚠️ Skipping ${brand_name} generic '${generic_name}' not found.`
          );
          continue;
        }

        await BrandedMedicine.updateOne(
          {
            name: brand_name.trim(), // 👈 CORRECTED FIELD NAME
            generic: generic._id,
          },
          {
            $set: {
              company: company?.trim(),
              packing: packing?.trim(),
              price_to_retailer: parseFloat(price_to_retailer),
              mrp: parseFloat(MRP),
              source: "Uploaded CSV",
              last_updated: new Date(),
            },
          },
          { upsert: true }
        );
      }
    } catch (err) {
      console.error("❌ Error inserting/updating:", item, err);
    }
  }

  console.log(`✅ Imported ${results.length} records`);
};
