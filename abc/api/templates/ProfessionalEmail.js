/**
 * Professional Email Template for Payivva Billing System
 * Ultra-robust version designed for maximum compatibility and premium aesthetics.
 */
export const getProfessionalEmailTemplate = ({ 
  myBusiness, 
  customer, 
  invoiceMeta, 
  totals, 
  currency, 
  logoCid,
  invoiceData 
}) => {
  const isQuotation = invoiceMeta.docType === 'quotation';
  const docTitle = isQuotation ? 'Quotation' : 'Tax Invoice';
  
  const status = (invoiceData.status || '').toLowerCase();
  const rawPending = Number(invoiceData.pendingAmount) || 0;
  const showPending = status !== 'paid' && !isQuotation && rawPending > 0;
  const pendingAmount = rawPending;

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>${docTitle} Notification</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { font-family: 'Inter', Helvetica, Arial, sans-serif !important; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Inter', Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 40px; overflow: hidden; box-shadow: 0 30px 60px -12px rgba(0,0,0,0.15); border: 1px solid #e2e8f0;">
              
              <!-- ══ HEADER ══ -->
              <tr>
                <td align="center" style="background-color: #0f172a; padding: 60px 40px;">
                  ${myBusiness.logo ? `<img src="cid:${logoCid}" alt="${myBusiness.name}" width="100" style="display: block; margin-bottom: 30px;" />` : ''}
                  <p style="margin: 0; font-size: 13px; font-weight: 900; color: #3b82f6; text-transform: uppercase; letter-spacing: 6px; font-family: 'Inter', sans-serif;">Official ${docTitle}</p>
                </td>
              </tr>

              <!-- ══ CONTENT BODY ══ -->
              <tr>
                <td style="padding: 50px 60px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="padding-bottom: 30px;">
                        <h2 style="margin: 0; font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: -1px; font-family: 'Inter', sans-serif;">Dear ${customer.name},</h2>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 40px;">
                        <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #64748b; font-weight: 400;">
                          Greetings! Please find attached the official <strong>${docTitle}</strong> issued by <strong>${myBusiness.name}</strong>. A detailed PDF version has been securely attached for your records.
                        </p>
                      </td>
                    </tr>

                    <!-- Status Card -->
                    <tr>
                      <td style="background-color: #f8fafc; border: 2px solid #f1f5f9; border-radius: 30px; padding: 40px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="50%" valign="top">
                              <p style="margin: 0 0 5px 0; font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">Reference ID</p>
                              <p style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a;">#${invoiceMeta.invoiceNumber}</p>
                            </td>
                            <td width="50%" valign="top" align="right">
                              <p style="margin: 0 0 5px 0; font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">Issued Date</p>
                              <p style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a;">${invoiceMeta.issueDate}</p>
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2" align="center" style="padding-top: 40px;">
                              <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 3px;">Total Amount</p>
                              <p style="margin: 0; font-size: 42px; font-weight: 900; color: #0f172a; line-height: 1;">${currency} ${totals.grandTotal.toLocaleString()}</p>
                            </td>
                          </tr>

                          ${showPending ? `
                          <tr>
                            <td colspan="2" style="padding-top: 30px;">
                              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fff1f2; border: 2px solid #e11d48; border-radius: 20px; padding: 25px; text-align: center;">
                                <tr>
                                  <td>
                                    <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 900; color: #e11d48; text-transform: uppercase; letter-spacing: 2px;">Action Required: Pending Balance (Udhaari)</p>
                                    <p style="margin: 0; font-size: 32px; font-weight: 900; color: #e11d48; line-height: 1.1;">${currency} ${pendingAmount.toLocaleString()}</p>
                                    <p style="margin: 10px 0 0 0; font-size: 12px; font-weight: 700; color: #be123c;">Please settle this outstanding amount at your earliest convenience.</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          ` : ''}
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td align="center" style="padding-top: 30px;">
                        <p style="margin: 0; font-size: 12px; color: #94a3b8; font-style: italic; font-weight: 600;">* Detailed breakdown and taxes are available in the attached PDF.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ══ INFO GRID ══ -->
              <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 50px 60px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td width="55%" valign="top">
                        <p style="margin: 0 0 10px 0; font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px;">Issued By (Seller)</p>
                        <p style="margin: 0; font-size: 14px; font-weight: 800; color: #334155;">${myBusiness.name}</p>
                        <p style="margin: 3px 0 0 0; font-size: 12px; font-weight: 600; color: #64748b; line-height: 1.5;">${myBusiness.address}</p>
                        ${myBusiness.gstin ? `<p style="margin: 10px 0 0 0; font-size: 11px; font-weight: 900; color: #0f172a; text-transform: uppercase;">GSTIN: ${myBusiness.gstin}</p>` : ''}
                      </td>
                      <td width="45%" valign="top" align="right">
                        <span style="background-color: #3b82f6; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 12px;">Payment Details</span>
                        <p style="margin: 0; font-size: 13px; font-weight: 800; color: #334155;">${myBusiness.bankName}</p>
                        <p style="margin: 3px 0 0 0; font-size: 12px; font-weight: 700; color: #64748b;">A/c: ${myBusiness.accountNumber}</p>
                        <p style="margin: 1px 0 0 0; font-size: 12px; font-weight: 700; color: #64748b;">IFSC: ${myBusiness.ifscCode}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ══ FOOTER ══ -->
              <tr>
                <td align="center" style="padding: 40px; background-color: #ffffff;">
                  <p style="margin: 0; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">
                    Powered by <span style="color: #0f172a;">Payivva Technologies</span>
                  </p>
                  <p style="margin: 8px 0 0 0; font-size: 11px; font-weight: 800; color: #3b82f6;">
                    &copy; ${new Date().getFullYear()} ${myBusiness.name}. All Rights Reserved.
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