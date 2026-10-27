// Renders a region of a PDF page to PNG (macOS, PDFKit), for guide illustrations (D-037).
// Usage: swift scripts/render-pdf-region.swift <pdf> <page> <out.png> [x y w h] [scale]
//   x y w h are fractions of the page (0–1, origin top-left); default the whole page. Scale defaults to 2.

import AppKit
import Foundation
import PDFKit

let a = CommandLine.arguments
guard a.count >= 4, let doc = PDFDocument(url: URL(fileURLWithPath: a[1])), let page = doc.page(at: Int(a[2])! - 1) else {
  FileHandle.standardError.write("usage: render-pdf-region.swift <pdf> <page> <out.png> [x y w h] [scale]\n".data(using: .utf8)!)
  exit(1)
}
let box = page.bounds(for: .mediaBox)
let f = a.count >= 8 ? (Double(a[4])!, Double(a[5])!, Double(a[6])!, Double(a[7])!) : (0.0, 0.0, 1.0, 1.0)
let scale = a.count >= 9 ? Double(a[8])! : 2.0
// PDF origin is bottom-left; the arguments use top-left.
let crop = CGRect(x: box.minX + f.0 * box.width, y: box.minY + (1 - f.1 - f.3) * box.height, width: f.2 * box.width, height: f.3 * box.height)
let width = Int(crop.width * scale), height = Int(crop.height * scale)
let ctx = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
ctx.fill(CGRect(x: 0, y: 0, width: width, height: height))
ctx.scaleBy(x: scale, y: scale)
ctx.translateBy(x: -crop.minX, y: -crop.minY)
page.draw(with: .mediaBox, to: ctx)
let rep = NSBitmapImageRep(cgImage: ctx.makeImage()!)
try rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: a[3]))
