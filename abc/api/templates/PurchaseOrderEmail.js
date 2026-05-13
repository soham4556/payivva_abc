/**
 * Purchase Order Email Template
 * Designed specifically for Vendor communication with a premium aesthetic.
 */
export const getPurchaseOrderEmailTemplate = ({ 
  myBusiness, 
  vendorName, 
  poMeta, 
  totalValue, 
  currency, 
  logoCid 
}) => {
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>Purchase Order Notification</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
        body { font-family: 'Outfit', Helvetica, Arial, sans-serif !important; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Outfit', Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 40px; overflow: hidden; box-shadow: 0 40px 80px -15px rgba(15, 23, 42, 0.15); border: 1px solid #e2e8f0;">
              
              <!-- ══ HEADER ══ -->
              <tr>
                <td align="center" style="background-color: #1e293b; padding: 70px 40px;">
                  ${myBusiness.logo ? `<img src="cid:${logoCid}" alt="${myBusiness.name}" width="110" style="display: block; margin-bottom: 35px;" />` : ''}
                  <div style="background-color: #f59e0b; color: #ffffff; padding: 6px 18px; border-radius: 50px; display: inline-block; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 15px;">Official Procurement</div>
                  <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 6px;">Purchase Order</h1>
                </td>
              </tr>

              <!-- ══ CONTENT BODY ══ -->
              <tr>
                <td style="padding: 60px 70px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="padding-bottom: 35px;">
                        <h2 style="margin: 0; font-size: 32px; font-weight: 900; color: #1e293b; letter-spacing: -1.5px; line-height: 1.1;">Dear ${vendorName},</h2>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 45px;">
                        <p style="margin: 0; font-size: 17px; line-height: 1.7; color: #475569; font-weight: 400;">
                          Please find the official <strong>Purchase Order</strong> from <strong>${myBusiness.name}</strong> attached below. We request you to process this order and confirm the delivery timeline.
                        </p>
                      </td>
                    </tr>

                    <!-- Order Card -->
                    <tr>
                      <td style="background-color: #fdfcfb; border: 2px solid #fffbeb; border-radius: 35px; padding: 45px; border-left: 8px solid #f59e0b;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="50%" valign="top">
                              <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">Order Number</p>
                              <p style="margin: 0; font-size: 18px; font-weight: 800; color: #1e293b;">#${poMeta.poNumber}</p>
                            </td>
                            <td width="50%" valign="top" align="right">
                              <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">Order Date</p>
                              <p style="margin: 0; font-size: 18px; font-weight: 800; color: #1e293b;">${poMeta.date}</p>
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2" align="center" style="padding-top: 45px;">
                              <div style="width: 60px; height: 2px; background-color: #e2e8f0; margin-bottom: 25px;"></div>
                              <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 4px;">Total Order Value</p>
                              <p style="margin: 0; font-size: 48px; font-weight: 900; color: #f59e0b; line-height: 1;">${currency} ${totalValue.toLocaleString()}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td align="center" style="padding-top: 40px;">
                        <p style="margin: 0; font-size: 13px; color: #94a3b8; font-style: italic; font-weight: 700;">* Itemized details and delivery terms are included in the attached PDF.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ══ BUSINESS GRID ══ -->
              <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 60px 70px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td valign="top">
                        <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">Issued By</p>
                        <p style="margin: 0; font-size: 16px; font-weight: 900; color: #1e293b;">${myBusiness.name}</p>
                        <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: 600; color: #64748b; line-height: 1.6;">${myBusiness.address}</p>
                        ${myBusiness.gstin ? `<p style="margin: 15px 0 0 0; font-size: 12px; font-weight: 900; color: #1e293b;">GSTIN: ${myBusiness.gstin}</p>` : ''}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ══ FOOTER ══ -->
              <tr>
                <td align="center" style="padding: 50px; background-color: #1e293b;">
                  <p style="margin: 0; font-size: 11px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 3px;">
                    Powered by <span style="color: #ffffff;">Payivva Professional Billing System</span>
                  </p>
                  <p style="margin: 12px 0 0 0; font-size: 12px; font-weight: 800; color: #f59e0b;">
                    &copy; ${new Date().getFullYear()} ${myBusiness.name}.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
