// const puppeteer = require('puppeteer');

// async function scrapeLinks() {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
  
//   // Navigate to the page containing the links
//   await page.goto('YOUR_URL_HERE');
  
//   // Extract links from the page
//   const links = await page.evaluate(() => {
//     const links = [];
//     // Find all <a> elements within <ul> elements with class "alpha-drug-list"
//     const anchorTags = document.querySelectorAll('ul.alpha-drug-list a');
//     anchorTags.forEach(tag => {
//       links.push(tag.href);
//     });
//     return links;
//   });

//   await browser.close();
  
//   return links;
// }

// // Call the function and handle the returned links
// scrapeLinks().then(links => {
//   console.log(links);
// }).catch(error => {
//   console.error('Error scraping links:', error);
// });


// const puppeteer = require('puppeteer');
import puppeteer from "puppeteer";
import fs from 'fs';

let allLinks = [];
let data = [];
async function scrapeMedicineData() {
  // console.log();
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
});
  const page = await browser.newPage();

  // Step 1: Navigate to the main page containing diseases
  await page.goto('https://www.netmeds.com/prescriptions', {
    waitUntil: "domcontentloaded",
    });

  // Step 2: Extract the list of diseases
  // const diseases = await page.evaluate(() => {
  //   const diseaseLinks = Array.from(document.querySelectorAll('.panel-group .panel-title a'));
  //   return diseaseLinks.map(link => ({
  //     name: link.innerText.trim(),
  //     url: link.href
  //   }));
  // });
  let diseases = [{name : 'ADHD', url : 'https://www.netmeds.com/prescriptions/adhd'}]

  allLinks = diseases;
  console.log('diseases are ', diseases);

  // Step 3: Iterate over each disease and scrape data for its medicines
  const allMedicineData = [];
  for (const disease of diseases) {
    await page.goto(disease.url, {
      waitUntil: "domcontentloaded",
      });

    const medicineData = await page.evaluate(() => {
      const medicines = Array.from(document.querySelectorAll('.drug-list-title'));
      const medicineDetails = [];

      for (const medicine of medicines) {
        // const diseaseName = medicine.innerText.trim();
        const medicineList = medicine.nextElementSibling.querySelectorAll('.product-item');

        for (const item of medicineList) {
          const medicineName = item.innerText.trim();
          const medicineUrl = item.querySelector('a').href;
          // medicineDetails.push({ disease: diseaseName, name: medicineName, url: medicineUrl });
          medicineDetails.push({name: medicineName, url: medicineUrl });
        }
      }

      return medicineDetails;
    });

    allMedicineData.push(...medicineData);
  }
  console.log("allMedicineData is ", allMedicineData);

  // Step 4: Iterate over each medicine URL and scrape detailed data
  const detailedMedicineData = [];
  for (const medicine of allMedicineData) {
    await page.goto(medicine.url, {
      waitUntil: "domcontentloaded",
      });

    const medicineDetails = await page.evaluate(() => {
      const details = {};

      details.name = document.querySelector('.prodName h1')?.innerText.trim();
      details.genericDrug = document.querySelector('.drug-manu a')?.innerText.trim();
      details.mrp = document.querySelector('.final-price')?.innerText.trim();
      details.bestPrice = document.querySelector('#barBestPrice')?.innerText.trim();
      details.manufacturer = document.querySelector('.drug-manu a[href*="manufacturers"]')?.innerText.trim();
      details.countryOfOrigin = document.querySelector('.origin_text')?.innerText.trim();
      details.rxRequired = document.querySelector('.req_Rx')?.innerText?.trim();

      details.about = document.getElementById('np_tab1')?.querySelector('.inner-content')?.innerText?.replace(/\n/g, ' ');
      details.uses = document.getElementById('np_tab3')?.querySelector('.inner-content')?.innerText?.replace(/\n/g, ' ');
      details.working = document.getElementById('np_tab5')?.querySelector('.inner-content')?.innerText?.replace(/\n/g, ' ');
      details.directions = document.getElementById('np_tab6')?.querySelector('.inner-content')?.innerText?.replace(/\n/g, ' ');
      details.sideEffects = document.getElementById('np_tab7')?.querySelector('.inner-content')?.innerText?.replace(/\n/g, ' ');
      details.warnings = document.getElementById('np_tab9')?.querySelector('.inner-content')?.innerText?.replace(/\n/g, ' ');
      details.interactions = document.getElementById('np_tab11')?.querySelector('.inner-content')?.innerText?.replace(/\n/g, ' ');
      details.synopsis = document.getElementById('np_tab12')?.querySelector('.inner-content')?.innerText?.replace(/\n/g, ' ');
      details.moreInfo = document.getElementById('np_tab13')?.querySelector('.inner-content')?.innerText?.replace(/\n/g, ' ');
      details.faqs = document.getElementById('np_tab14')?.querySelector('.inner-content')?.innerText?.replace(/\n/g, ' ');
      details.references = document.getElementById('np_tab15')?.querySelector('.inner-content')?.innerText?.replace(/\n/g, ' ');
      details.authorDetails = document.getElementById('np_tab18')?.querySelector('.inner-content')?.innerText?.replace(/\n/g, ' ');

      return details;
    });

    detailedMedicineData.push({ ...medicine, ...medicineDetails });
  }
  console.log("detailedMedicineData ", detailedMedicineData);

  await browser.close();
  const jsonData = JSON.stringify(detailedMedicineData, null, 2);
  fs.appendFileSync('items.json', jsonData);

  // return diseases;
  return detailedMedicineData;
}

// Call the function to scrape medicine data
console.log('allLinks ', allLinks);
scrapeMedicineData()
  .then(data => {
    console.log('Medicine Data:', data);
  })
  .catch(error => {
    console.error('Error scraping medicine data:', error);
  });


  // <div class="left-block">
  //   <div class="clearfix"></div>
  //   <div class="drug-content">
  //     <div class="product_desc_info">
  //       <div>
  //       <div id="np_tab1" class="druginfo_cont druginfo-dv bottom-line active"><div class="row"><div class="col-md-12"><div class="inner-content"><h2>INTRODUCTION</h2><p>ALZIL M FORTE is a combination of Donepezil and Memantine which belongs to the group of medicines called Acetylcholinesterase inhibitors and NMDA receptor antagonists respectively. It is used to treat moderate to severe dementia caused due to Alzheimer’s disease (Alzheimer’s type dementia) in patients previously treated with donepezil alone. Alzheimer’s type dementia is a type of brain disease where the dementia (disorder of thoughts, memory, and behaviour) happens due to degeneration of brain cells that carry memories.</p> <p>Donepezil is an acetylcholinesterase inhibitor. It acts by restoring the levels of a brain chemical called acetylcholine that carries messages within the nerve cells. Memantine is a NMDA receptor antagonist. It acts by suppressing the overactivation of certain brain chemicals (glutamate) that damages the nerve cells. Together, they help in reducing the symptoms of Alzheimer’s type dementia.</p> <p>Before taking ALZIL M FORTE inform your doctor if you have any liver, kidney, or heart problems. You must also inform your doctor if you have any stomach problems (ulcer or bleeding in the gut), breathing problems (asthma), bladder problems, epilepsy or are severely dehydrated due to excessive sweating, vomiting or diarrhea.</p> <p>Consult your doctor before taking ALZIL M FORTE if you are pregnant or breastfeeding. ALZIL M FORTE may cause nausea and vomiting during the initial days of therapy. These side effects are unusually temporary and disappears as your body gets used to ALZIL M FORTE. However, consult your doctor if they worsen. Other most common side effects of taking ALZIL M FORTE are headache, dizziness, and loss of appetite.</p> </div> <div class="clear1"></div></div></div></div>
  //       <div id="np_tab3" class="druginfo_cont druginfo-dv bottom-line active"><div class="row"><div class="col-md-12"><div class="inner-content"><h2>USES OF ALZIL M FORTE</h2><ul> <li>Treats moderate to severe Alzheimer’s type dementia</li> </ul> </div> <div class="clear1"></div></div></div></div>
  //       </div>
  //     </div>
  //   </div>
  // </div>