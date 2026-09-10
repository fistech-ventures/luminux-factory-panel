import { Providers } from "@lib/context";
import { buildBrandThemeInlineStyle } from "@modules/settings/lib/brandPalette";
import { getCachedQuickSettingsFn } from "@modules/settings/lib/metadata";
import "@styles/index.scss";
import type { Metadata } from "next";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import { Roboto } from "next/font/google";
import brandIcon from "./brand_icon.png";
import "./globals.css";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

const defaultMetadataTitle = "Luminux Lighting Showroom Panel";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedQuickSettingsFn();
  const title = settings?.name?.trim() || defaultMetadataTitle;
  const description = settings?.description?.trim() || undefined;
  const iconUrl = settings?.icon?.trim();

  return {
    title,
    description,
    icons: iconUrl
      ? { shortcut: iconUrl, icon: iconUrl }
      : { shortcut: brandIcon.src },
  };
}

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const fontWithMorePropsCreateFn = (
    fontDefinition: NextFontWithVariable,
    originalVariableName: string,
  ) => {
    return { ...fontDefinition, originalVariableName };
  };

  const robotoFont = fontWithMorePropsCreateFn(roboto, "--font-roboto");

  const settings = await getCachedQuickSettingsFn();
  const primary = settings?.themePrimaryColor?.trim();
  const secondary = settings?.themeSecondayColor?.trim();
  const brandHtmlStyle = primary
    ? buildBrandThemeInlineStyle(primary, secondary)
    : undefined;

  return (
    <html lang="en" style={brandHtmlStyle}>
      <body className="bg-[var(--color-gray-50)] dark:bg-[var(--color-dark-gray)] designed_scrollbar">
        <Providers brandPrimaryHex={primary} nextFont={[robotoFont]}>
          {children}
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
