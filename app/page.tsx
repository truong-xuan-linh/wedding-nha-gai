import fs from "fs";
import path from "path";
import ClientPage from "./ClientPage";

export default function Home() {
  const htmlContent = fs.readFileSync(
    path.join(process.cwd(), "app", "body-content.html"),
    "utf-8"
  );

  return <ClientPage htmlContent={htmlContent} />;
}
