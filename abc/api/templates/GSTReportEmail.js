/**
 * GST Report Email Template
 * Designed for Tax Compliance communication with a formal indigo aesthetic.
 */
export const getGSTReportEmailTemplate = ({ 
  myBusiness, 
  reportMeta, 
  logoCid 
}) => {
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>GST Compliance Report</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif !important; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f1f9; font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 40px; overflow: hidden; box-shadow: 0 40px 100px -20px rgba(79, 70, 229, 0.2); border: 1px solid #e0e0f0;">
              
              <!-- ══ HEADER ══ -->
              <tr>
                <td align="center" style="background-color: #4f46e5; padding: 70px 40px;">
                  ${myBusiness.logo ? `<img src="cid:${logoCid}" alt="${myBusiness.name}" width="100" style="display: block; margin-bottom: 35px; filter: brightness(0) invert(1);" />` : ''}
                  <div style="background-color: rgba(255,255,255,0.2); color: #ffffff; padding: 6px 18px; border-radius: 50px; display: inline-block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 15px;">Compliance Filing</div>
                  <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 5px;">GST Report</h1>
                </td>
              </tr>

              <!-- ══ CONTENT BODY ══ -->
              <tr>
                <td style="padding: 60px 70px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="padding-bottom: 35px;">
                        <h2 style="margin: 0; font-size: 28px; font-weight: 800; color: #1e1b4b; letter-spacing: -1px;">Tax Compliance Filing</h2>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 45px;">
                        <p style="margin: 0; font-size: 16px; line-height: 1.8; color: #4b5563; font-weight: 500;">
                          Greetings! Please find attached the <strong>GST Compliance Report</strong> for <strong>${myBusiness.name}</strong>. This document contains the necessary transactional data required for tax filing and audit purposes.
                        </p>
                      </td>
                    </tr>

                    <!-- Report Detail Card -->
                    <tr>
                      <td style="background-color: #f5f3ff; border: 2px solid #ddd6fe; border-radius: 35px; padding: 45px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="50%" valign="top">
                              <p style="margin: 0 0 8px 0; font-size: 10px; font-weight: 800; color: #6d6e71; text-transform: uppercase; letter-spacing: 2px;">Report Type</p>
                              <p style="margin: 0; font-size: 16px; font-weight: 700; color: #4f46e5;">GST Transaction Audit</p>
                            </td>
                            <td width="50%" valign="top" align="right">
                              <p style="margin: 0 0 8px 0; font-size: 10px; font-weight: 800; color: #6d6e71; text-transform: uppercase; letter-spacing: 2px;">Generated On</p>
                              <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1e1b4b;">${reportMeta.date}</p>
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2" style="padding-top: 35px; border-top: 1px dashed #c4b5fd; margin-top: 35px;">
                                <p style="margin: 0 0 10px 0; font-size: 10px; font-weight: 800; color: #6d6e71; text-transform: uppercase; letter-spacing: 2px;">Organization GSTIN</p>
                                <p style="margin: 0; font-size: 18px; font-weight: 800; color: #1e1b4b; letter-spacing: 2px;">${myBusiness.gstin || 'N/A'}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td align="center" style="padding-top: 40px;">
                        <p style="margin: 0; font-size: 12px; color: #6b7280; font-style: italic; font-weight: 600;">* This is a system-generated audit report for professional tax filing.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ══ FOOTER ══ -->
              <tr>
                <td align="center" style="padding: 50px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">
                    Confidential Report • <span style="color: #4f46e5;">Payivva Compliance System</span>
                  </p>
                  <p style="margin: 10px 0 0 0; font-size: 12px; font-weight: 700; color: #1e1b4b;">
                    &copy; ${new Date().getFullYear()} ${myBusiness.name}
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
