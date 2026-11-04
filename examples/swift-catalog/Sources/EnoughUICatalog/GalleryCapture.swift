import SwiftUI
import EnoughUI
#if os(macOS)
import AppKit

@MainActor
func captureMacGallery(to output: String) throws {
    let directory = URL(fileURLWithPath: output)
    try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
    for example in GalleryExample.allCases {
        for (name, theme) in [("light", EnoughTheme.light), ("dark", EnoughTheme.dark)] {
            let host = NSHostingView(rootView: EnoughThemeProvider(theme: theme) {
                GalleryFixture(example: example).frame(width: 640, height: example.height)
            })
            host.frame = NSRect(x: 0, y: 0, width: 640, height: example.height)
            let window = NSWindow(contentRect: host.frame, styleMask: [.borderless], backing: .buffered, defer: false)
            window.contentView = host
            window.appearance = NSAppearance(named: name == "dark" ? .darkAqua : .aqua)
            window.setFrameOrigin(NSPoint(x: 10000, y: 10000))
            window.orderFront(nil)
            host.layoutSubtreeIfNeeded()
            RunLoop.current.run(until: Date().addingTimeInterval(0.2))
            host.layoutSubtreeIfNeeded()
            guard let bitmap = host.bitmapImageRepForCachingDisplay(in: host.bounds) else { throw CocoaError(.fileWriteUnknown) }
            host.cacheDisplay(in: host.bounds, to: bitmap)
            guard let png = bitmap.representation(using: .png, properties: [:]) else { throw CocoaError(.fileWriteUnknown) }
            try png.write(to: directory.appendingPathComponent("\(example.id)-macos-\(name).png"))
            window.contentView = nil
            window.orderOut(nil)
        }
    }
    print("Captured \(GalleryExample.allCases.count * 2) real macOS gallery previews.")
}
#endif
