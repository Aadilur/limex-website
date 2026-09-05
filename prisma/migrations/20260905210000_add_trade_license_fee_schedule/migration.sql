-- Seed the authority-specific trade-licence schedule in the JSON settings row.
-- The application merges any newly added official catalogue rows at read time while
-- preserving administrator edits and custom rows.
SET @trade_tariffs = JSON_ARRAY(
  JSON_OBJECT('key', 'scheduled-bank-financial-institution', 'label', 'Scheduled bank / financial institution', 'amount', 10000),
  JSON_OBJECT('key', 'insurance-branch', 'label', 'Insurance company branch', 'amount', 5000),
  JSON_OBJECT('key', 'money-exchange', 'label', 'Money exchange', 'amount', 5000),
  JSON_OBJECT('key', 'private-university', 'label', 'Private university', 'amount', 5000),
  JSON_OBJECT('key', 'private-college-school', 'label', 'Private college / large school', 'amount', 3000),
  JSON_OBJECT('key', 'kindergarten', 'label', 'Kindergarten', 'amount', 2000),
  JSON_OBJECT('key', 'training-centre', 'label', 'Training centre', 'amount', 1000),
  JSON_OBJECT('key', 'special-category-contractor', 'label', 'Special-category contractor', 'amount', 6000),
  JSON_OBJECT('key', 'first-grade-contractor', 'label', 'First-grade contractor / construction firm', 'amount', 4000),
  JSON_OBJECT('key', 'supplier', 'label', 'Supplier', 'amount', 2000),
  JSON_OBJECT('key', 'real-estate-developer', 'label', 'Builder / developer / real-estate business', 'amount', 6000),
  JSON_OBJECT('key', 'indenting-commission-agent', 'label', 'Indenting / commission agent / dealer', 'amount', 2000),
  JSON_OBJECT('key', 'clearing-forwarding-agent', 'label', 'Clearing and forwarding agent', 'amount', 2500),
  JSON_OBJECT('key', 'travelling-agent', 'label', 'Travelling agent', 'amount', 2000),
  JSON_OBJECT('key', 'recruiting-agent', 'label', 'Recruiting agent', 'amount', 5000),
  JSON_OBJECT('key', 'textile-mill', 'label', 'Textile mill', 'amount', 4500),
  JSON_OBJECT('key', 'garments-factory', 'label', 'Garments factory', 'amount', 8000),
  JSON_OBJECT('key', 'pharmaceutical-factory', 'label', 'Pharmaceutical factory', 'amount', 5000),
  JSON_OBJECT('key', 'chemical-factory', 'label', 'Chemical factory', 'amount', 3000),
  JSON_OBJECT('key', 'cold-storage', 'label', 'Cold storage', 'amount', 3000),
  JSON_OBJECT('key', 'printing-factory', 'label', 'Printing factory', 'amount', 1000),
  JSON_OBJECT('key', 'engineering-workshop-large', 'label', 'Large engineering workshop', 'amount', 1500),
  JSON_OBJECT('key', 'motor-workshop-large', 'label', 'Large motor workshop', 'amount', 2000),
  JSON_OBJECT('key', 'motor-workshop-small', 'label', 'Small motor workshop', 'amount', 1000),
  JSON_OBJECT('key', 'restaurant-ac', 'label', 'Air-conditioned restaurant', 'amount', 2500),
  JSON_OBJECT('key', 'restaurant-non-ac', 'label', 'Non-air-conditioned restaurant', 'amount', 1000),
  JSON_OBJECT('key', 'fast-food-shop', 'label', 'Fast-food shop', 'amount', 3000),
  JSON_OBJECT('key', 'hotel-five-star', 'label', 'Five-star residential hotel', 'amount', 50000),
  JSON_OBJECT('key', 'hotel-non-ac', 'label', 'Non-air-conditioned residential hotel', 'amount', 5000),
  JSON_OBJECT('key', 'guest-house-ac', 'label', 'Air-conditioned guest / rest house', 'amount', 10000),
  JSON_OBJECT('key', 'cinema-ac', 'label', 'Air-conditioned cinema', 'amount', 3000),
  JSON_OBJECT('key', 'community-centre-ac', 'label', 'Air-conditioned community centre', 'amount', 4000),
  JSON_OBJECT('key', 'carrier-truck-trailer-agency', 'label', 'Carrier / truck / trailer agency', 'amount', 10000),
  JSON_OBJECT('key', 'microbus', 'label', 'Microbus', 'amount', 300),
  JSON_OBJECT('key', 'taxi-cab-car', 'label', 'Taxi cab / car', 'amount', 300),
  JSON_OBJECT('key', 'medicine-shop', 'label', 'Medicine shop', 'amount', 1000),
  JSON_OBJECT('key', 'fish-market', 'label', 'Fish market', 'amount', 3000),
  JSON_OBJECT('key', 'furniture-brand', 'label', 'Brand furniture showroom', 'amount', 20000),
  JSON_OBJECT('key', 'paint-agency', 'label', 'Paint agency', 'amount', 2000),
  JSON_OBJECT('key', 'hardware-materials', 'label', 'Hardware materials shop', 'amount', 1200),
  JSON_OBJECT('key', 'essential-goods-retail', 'label', 'Essential-goods retail shop', 'amount', 500),
  JSON_OBJECT('key', 'beauty-parlour-ac', 'label', 'Air-conditioned beauty parlour', 'amount', 5000),
  JSON_OBJECT('key', 'hair-salon-non-ac', 'label', 'Non-air-conditioned hair-dressing salon', 'amount', 1000),
  JSON_OBJECT('key', 'jewellery-showroom', 'label', 'Jewellery shop with showroom', 'amount', 8000),
  JSON_OBJECT('key', 'international-courier', 'label', 'International courier / parcel service', 'amount', 25000),
  JSON_OBJECT('key', 'phone-internet-cyber-large', 'label', 'Large phone / fax / internet / cyber cafe', 'amount', 2000),
  JSON_OBJECT('key', 'security-service', 'label', 'Security service', 'amount', 5000),
  JSON_OBJECT('key', 'ready-made-garments-small', 'label', 'Ready-made garments shop · up to 200 sq. ft.', 'amount', 500),
  JSON_OBJECT('key', 'shoe-shop-retail', 'label', 'Small shoe shop / retail', 'amount', 1500),
  JSON_OBJECT('key', 'warehouse', 'label', 'Warehouse', 'amount', 10000),
  JSON_OBJECT('key', 'super-shop-mega-mall', 'label', 'Super shop / mega mall', 'amount', 3000),
  JSON_OBJECT('key', 'pharmacy-small', 'label', 'Small pharmacy', 'amount', 1000),
  JSON_OBJECT('key', 'mobile-agency-small', 'label', 'Small mobile-phone / accessories agency', 'amount', 2000),
  JSON_OBJECT('key', 'brick-kiln', 'label', 'Brick kiln', 'amount', 8000),
  JSON_OBJECT('key', 'transport-agency-contractor', 'label', 'Transport agency / contractor', 'amount', 5000),
  JSON_OBJECT('key', 'health-fitness-club', 'label', 'Health / fitness club', 'amount', 5000),
  JSON_OBJECT('key', 'ship-breaking', 'label', 'Ship-breaking business', 'amount', 25000),
  JSON_OBJECT('key', 'generic-other-income-tax-paid', 'label', 'Other business · income tax paid', 'amount', 1000),
  JSON_OBJECT('key', 'generic-other-income-tax-not-paid', 'label', 'Other business · income tax not paid', 'amount', 500),
  JSON_OBJECT('key', 'unlisted-business', 'label', 'Unlisted business · authority assessment required', 'amount', NULL)
);
SET @trade_ads = JSON_ARRAY(
  JSON_OBJECT('key', 'cutout-under-10-feet', 'label', 'Temporary cutout · under 10 ft', 'amount', 10000, 'unit', 'per month'),
  JSON_OBJECT('key', 'cutout-under-5-feet', 'label', 'Temporary cutout · under 5 ft', 'amount', 5000, 'unit', 'per month'),
  JSON_OBJECT('key', 'balloon', 'label', 'Advertising balloon', 'amount', 10000, 'unit', 'per month'),
  JSON_OBJECT('key', 'commercial-gate-toran', 'label', 'Commercial gate / toran', 'amount', 20000, 'unit', 'per month'),
  JSON_OBJECT('key', 'non-commercial-gate-toran', 'label', 'Non-commercial gate / toran', 'amount', 5000, 'unit', 'per month'),
  JSON_OBJECT('key', 'festoon-banner', 'label', 'Festoon / banner', 'amount', 500, 'unit', 'per 30 days'),
  JSON_OBJECT('key', 'large-poster', 'label', 'Large poster · maximum 3 × 2 ft', 'amount', 10, 'unit', 'per day'),
  JSON_OBJECT('key', 'small-poster', 'label', 'Small poster · maximum 1.5 × 1 ft', 'amount', 7, 'unit', 'per day'),
  JSON_OBJECT('key', 'canvas-ad', 'label', 'Canvas advertisement in wood frame', 'amount', 30000, 'unit', 'per month'),
  JSON_OBJECT('key', 'moving-ad', 'label', 'Moving advertisement', 'amount', 30000, 'unit', 'per month')
);
SET @limited_company_bands = JSON_ARRAY(
  JSON_OBJECT('upto', 100000, 'amount', 1500), JSON_OBJECT('upto', 500000, 'amount', 2000),
  JSON_OBJECT('upto', 1000000, 'amount', 3500), JSON_OBJECT('upto', 2500000, 'amount', 4500),
  JSON_OBJECT('upto', 5000000, 'amount', 5500), JSON_OBJECT('upto', 10000000, 'amount', 7500),
  JSON_OBJECT('upto', 50000000, 'amount', 10000), JSON_OBJECT('upto', NULL, 'amount', 12000)
);
UPDATE `BusinessToolSettings`
SET `settings` = JSON_SET(
  COALESCE(`settings`, JSON_OBJECT()),
  '$.tradeLicense', JSON_OBJECT(
    'dncc', JSON_OBJECT(
      'tariffRows', @trade_tariffs, 'limitedCompanyBands', @limited_company_bands,
      'signboardRates', JSON_OBJECT('identificationPerSqFt', 80, 'illuminatedPerSqFt', 300, 'nonIlluminatedPerSqFt', 150, 'ledPerSqFt', 20000),
      'vehicleSignboardRates', JSON_OBJECT('identificationPerSqFt', 0, 'illuminatedPerSqFt', 150, 'nonIlluminatedPerSqFt', 100, 'ledPerSqFt', 10000),
      'advertisingRates', @trade_ads, 'vatRate', 15, 'formFee', 0, 'bookFee', 270, 'otherFee', 500,
      'duplicateFee', NULL, 'amendmentFee', NULL, 'surcharge', JSON_OBJECT('graceMonth', 9, 'fixedMonthly', 100, 'percentOfAnnualLicense', 10),
      'sourceUrl', 'https://erevenue.dncc.gov.bd/cp/cportal/cp/northcc.aspx/index.html', 'effectiveDate', '2016-01-31',
      'note', 'Seeded from the Dhaka North, Dhaka South and Chattogram column of the City Corporation Model Tax Schedule, 2016. Confirm current e-revenue assessment before payment.'
    ),
    'dscc', JSON_OBJECT(
      'tariffRows', @trade_tariffs, 'limitedCompanyBands', @limited_company_bands,
      'signboardRates', JSON_OBJECT('identificationPerSqFt', 80, 'illuminatedPerSqFt', 300, 'nonIlluminatedPerSqFt', 150, 'ledPerSqFt', 20000),
      'vehicleSignboardRates', JSON_OBJECT('identificationPerSqFt', 0, 'illuminatedPerSqFt', 150, 'nonIlluminatedPerSqFt', 100, 'ledPerSqFt', 10000),
      'advertisingRates', @trade_ads, 'vatRate', 15, 'formFee', 50, 'bookFee', 270, 'otherFee', 500,
      'duplicateFee', NULL, 'amendmentFee', NULL, 'surcharge', JSON_OBJECT('graceMonth', 9, 'fixedMonthly', 100, 'percentOfAnnualLicense', 10),
      'sourceUrl', 'https://erevenue.dscc.gov.bd/cp/cportal/cp/southcc.aspx', 'effectiveDate', '2016-01-31',
      'note', 'Seeded from the Dhaka North, Dhaka South and Chattogram column of the City Corporation Model Tax Schedule, 2016. Confirm current e-revenue assessment before payment.'
    )
  ),
  '$."fees"."trade-license"."sourceUrl"', 'https://erevenue.dncc.gov.bd/cp/cportal/cp/northcc.aspx/index.html'
)
WHERE `id` = 'default';
