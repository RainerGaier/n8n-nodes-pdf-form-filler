All 156 tests pass. Here's a summary of the three workflow files created in test/n8n/:




1. 01-discover-fields.json — Discover Fields

Manual Trigger → Read Binary File (loads UKPN PDF) → PDF Form Filler (discoverFields operation)
Returns all 246 field names, types, and options from the UKPN form



2. 02-fill-form-static.json — Fill Form with Static Mapping

Manual Trigger → parallel: Read Binary File + Set (form data JSON) → Merge → PDF Form Filler (fillForm, static mapping)
22 field mappings covering applicant details (A1), site address (A3), description (B), start date (J), and signatory (L)
Demonstrates date formatting with DD/MM/YYYY



3. 03-fill-ukpn-dynamic.json — UKPN Application with Dynamic Mapping

Manual Trigger → parallel: Read Binary File + Set (data + mapping array in JSON) → Merge → PDF Form Filler (fillForm, dynamic mapping)
68 field mappings exercising all field types:
Text fields: applicant info, agent info, site address, contractor details, heat pump specs
Checkboxes: C-A, C-C, H generation, H heat pumps, H EV charge point, A2-Tick main contact
Radio groups: A3-previous offer, C-C Phase, D-Type of quote, E type of connection, E security, G-Domestic, G-Commercial, H1 type of generation, H2 How will HP be used, various H2 Yes/No radios
Realistic scenario: commercial development with solar PV, heat pumps, and EV charging



To test these in n8n, import the JSON files via Settings → Import Workflow (or drag-and-drop), ensuring the community node is installed and the PDF file path is accessible from your n8n instance.


>[!Note] Your cloud instance won't work for testing a custom community node that isn't published to npm yet. Cloud n8n only supports nodes from the npm registry. So this option is out for now.

Command running in background with ID: bb1399c. Output is being written to: C:\Users\gaierr\AppData\Local\Temp\claude\c--Users-gaierr-Energy-Projects-projects-n8n-nodes-pdf-form-filler\tasks\bb1399c.output