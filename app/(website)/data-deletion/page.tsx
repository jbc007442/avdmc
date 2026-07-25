export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          {/* Header */}

          <div className="bg-red-600 px-10 py-12 text-white">
            <h1 className="text-5xl font-bold">User Data Deletion Instructions</h1>

            <p className="mt-4 text-lg text-red-100">Effective Date: August 25, 2021</p>

            <p className="mt-6 max-w-3xl leading-8 text-red-50">
              This page explains how you can request deletion of your personal information that may
              be stored by M/S AV DMC.
            </p>
          </div>

          <div className="space-y-10 p-10">
            <section>
              <h2 className="mb-4 text-3xl font-bold">Request Data Deletion</h2>

              <p className="leading-8 text-gray-700">
                If you wish to request deletion of your personal data, please send an email from
                your registered email address to:
              </p>

              <div className="mt-6 rounded-xl border bg-slate-50 p-6">
                <p className="font-semibold">Email</p>

                <p className="mt-2 text-blue-700 font-medium">support@marketing.avdmc.com</p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold">Please Include</h2>

              <ul className="list-disc space-y-3 pl-6 leading-8 text-gray-700">
                <li>Your full name.</li>

                <li>Your registered email address.</li>

                <li>Your mobile number (if applicable).</li>

                <li>Your booking reference number (if available).</li>

                <li>A clear statement requesting deletion of your personal information.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold">Processing Time</h2>

              <p className="leading-8 text-gray-700">
                After verifying your identity, we will process your request as soon as reasonably
                possible. Some records may be retained where required by applicable laws, taxation
                requirements, fraud prevention, dispute resolution, or other legitimate legal
                obligations. Meta allows either an automated callback or a public instructions page
                for data deletion requests; this page serves as the public instructions URL.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold">Contact Information</h2>

              <div className="rounded-xl border bg-slate-50 p-6">
                <h3 className="text-xl font-bold text-blue-700">M/S AV DMC</h3>

                <div className="mt-5 space-y-4 text-gray-700">
                  <p>
                    <strong>Registered Office</strong>
                    <br />
                    3rd Floor, 551
                    <br />
                    Shakti Khand IV
                    <br />
                    Indirapuram
                    <br />
                    Ghaziabad
                    <br />
                    Uttar Pradesh – 201014
                    <br />
                    India
                  </p>

                  <p>
                    <strong>Website</strong>
                    <br />
                    https://marketing.avdmc.com
                  </p>

                  <p>
                    <strong>Email</strong>
                    <br />
                    support@marketing.avdmc.com
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="border-t bg-slate-100 px-10 py-8 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} M/S AV DMC.
            <br />
            All Rights Reserved.
          </div>
        </div>
      </div>
    </main>
  );
}
