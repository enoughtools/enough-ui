import UIKit
import SwiftUI
import EnoughUI

/// An isolated simulator app that captures the same compiled fixtures as the native demo.
@main
final class GalleryCaptureApp: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        let window = UIWindow(frame: UIScreen.main.bounds)
        let container = UIViewController()
        window.rootViewController = container
        window.makeKeyAndVisible()
        self.window = window
        Task { @MainActor in
            do {
                let directory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("SwiftGallery")
                try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
                for example in GalleryExample.allCases {
                    for (name, theme) in [("light", EnoughTheme.light), ("dark", EnoughTheme.dark)] {
                        let host = UIHostingController(rootView: EnoughThemeProvider(theme: theme) {
                            GalleryFixture(example: example).frame(width: 390, height: example.height)
                        }.ignoresSafeArea())
                        host.overrideUserInterfaceStyle = name == "dark" ? .dark : .light
                        container.addChild(host)
                        container.view.addSubview(host.view)
                        host.didMove(toParent: container)
                        host.view.frame = CGRect(x: 0, y: 0, width: 390, height: example.height)
                        host.view.layoutIfNeeded()
                        try await Task.sleep(nanoseconds: 100_000_000)
                        // Snapshot the native UIView hierarchy, including UIKit-backed controls.
                        let renderer = UIGraphicsImageRenderer(size: CGSize(width: 390, height: example.height))
                        let image = renderer.image { _ in
                            host.view.drawHierarchy(in: CGRect(x: 0, y: 0, width: 390, height: example.height), afterScreenUpdates: true)
                        }
                        guard let png = image.pngData() else { throw CocoaError(.fileWriteUnknown) }
                        try png.write(to: directory.appendingPathComponent("\(example.id)-ios-\(name).png"))
                        host.willMove(toParent: nil)
                        host.view.removeFromSuperview()
                        host.removeFromParent()
                    }
                }
                try "Captured all iOS gallery fixtures.".write(to: directory.appendingPathComponent("DONE"), atomically: true, encoding: .utf8)
            } catch {
                let directory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
                try? String(describing: error).write(to: directory.appendingPathComponent("ERROR"), atomically: true, encoding: .utf8)
            }
        }
        return true
    }
}
