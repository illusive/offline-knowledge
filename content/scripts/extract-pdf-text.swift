// Extracts the text layer of PDF source snapshots into content/sources/text/<id>.txt (macOS, PDFKit),
// so the pack build can check guide quotes against PDF sources (D-033).
// The first line records the snapshot's SHA-256; the build refuses text made from another snapshot.
// Usage: swift scripts/extract-pdf-text.swift <source id> <snapshot path> <sha256> <output path>

import Foundation
import PDFKit

let args = CommandLine.arguments
guard args.count == 5, let doc = PDFDocument(url: URL(fileURLWithPath: args[2])) else {
  FileHandle.standardError.write("usage: extract-pdf-text.swift <id> <pdf> <sha256> <out>\n".data(using: .utf8)!)
  exit(1)
}
var out = "# \(args[1]) sha256 \(args[3])\n"
for i in 0..<doc.pageCount {
  out += "--- p\(i + 1)\n" + (doc.page(at: i)?.string ?? "") + "\n"
}
try out.write(toFile: args[4], atomically: true, encoding: .utf8)
