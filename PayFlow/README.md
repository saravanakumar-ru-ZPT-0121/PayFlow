# Zoho Ticket URL Helper (Chrome/Edge Extension)

This extension reads the current CRM ticket page URL and generates:

https://assist.zohobookings.com/#/customer/payments?zd_ticket_id=<ticket-id>&bookedFrom=PayVKYC

Now it also supports editable settings in the popup:

- Base URL can be changed.
- `bookedFrom` can be changed.
- Additional query params can be added.
- Dark mode can be toggled.

## How it works

- It checks the active tab URL.
- It extracts the last numeric segment from the path as `zd_ticket_id`.
- It builds the final URL with configured `bookedFrom` and extra params.
- You can either open the generated URL directly or copy it.
- Settings are saved using browser extension storage.

Example source URL:

https://crmplus.zoho.in/zohocorppace/index.do/cxapp/agent/zoho/payment-gateway/requests/details/34447478

Generated URL:

https://assist.zohobookings.com/#/customer/payments?zd_ticket_id=34447478&bookedFrom=PayVKYC

## Install locally (Chrome)

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder: `zoho-url-helper`.

## Install locally (Edge)

1. Open `edge://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder: `payflow`.

## Notes

- The extension works best when the active tab is a CRM ticket details page.
- You can add extra params as one per line in `key=value` format.
