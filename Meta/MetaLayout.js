// components/Layout.js
import Head from "next/head";

export default function MetaLayout({
  children,
  title = "Start Online Consultation - Online Weight Loss Clinic",
  description = "In order for our doctors to assess your suitability for treatment, you will be asked to complete a short medical questionnaire at the next step.",
  canonical,
}) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content={description || "Default description."}
        />
        {canonical && <link rel="canonical" href={canonical} />}
      </Head>
      {children}
    </>
  );
}
