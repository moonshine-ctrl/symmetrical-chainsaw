export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
          <style dangerouslySetInnerHTML={{ __html: `
            @page {
              size: A4;
              margin: 1.5cm 2cm;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .no-print {
                display: none;
              }
              .print-header {
                  position: fixed;
                  top: 0;
                  left: 0;
                  right: 0;
              }
            }
          `}} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
