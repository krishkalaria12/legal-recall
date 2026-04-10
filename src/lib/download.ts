import fs from "fs";

export async function downloadFromURL(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download file: ${res.status} ${res.statusText}`);
  }

  const fileName = `/tmp/uploadthing_${Date.now().toString()}.pdf`;
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.promises.writeFile(fileName, buffer);
  return fileName;
}

