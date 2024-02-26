// const puppeteer = require('puppeteer');
import puppeteer from "puppeteer";
import fs from "fs";
import medicineJson from "./meds.json" assert { type: "json" };
import linksJson from "./links.json" assert { type: "json" };

let allLinks = linksJson;
console.log("allLinks?.slice(0,1) ", allLinks?.slice(0, 1));

async function scrapeMedicineData() {
  // console.log();
  const allMeds = [];
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  // Step 3: Iterate over each disease and scrape data for its medicines
  const allMedicineData = [];
  for (const disease of allLinks) {
    await page.goto(disease.url, {
      waitUntil: "domcontentloaded",
    });

    const medicineData = await page.evaluate(() => {
      const medicines = Array.from(
        document.querySelectorAll(".product-item a")
      );
      console.log("medicines ", medicines);
      const medicineDetails = [];

      for (const item of medicines) {
        const medicineName = item?.innerText?.trim();
        const medicineUrl = item?.getAttribute("href");
        medicineDetails.push({ name: medicineName, url: medicineUrl });
      }

      allMeds = medicineDetails;
      return medicineDetails;
    });

    allMedicineData.push(...medicineData);
  }
  console.log("allMedicineData ", allMedicineData);
  // allMeds = allMedicineData;

  const jsonLinks = JSON.stringify(allMedicineData, null, 2);
  fs.appendFileSync("allMeds.json", jsonLinks);
  // const jsonData = JSON.stringify(detailedMedicineData, null, 2);
  // fs.appendFileSync("items.json", jsonData);

  // return detailedMedicineData;
  return allMeds;
}

scrapeMedicineData()
  .then((data) => {
    console.log("Medicine Data:", data);
  })
  .catch((error) => {
    console.error("Error scraping medicine data:", error);
  });
