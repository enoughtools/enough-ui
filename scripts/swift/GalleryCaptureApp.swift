import UIKit
import SwiftUI
import EnoughUI

/// An isolated simulator app that captures the same compiled fixtures as the native demo.
@main
final class GalleryCaptureApp: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, configurationForConnecting session: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let configuration = UISceneConfiguration(name: "Default", sessionRole: session.role)
        configuration.sceneClass = UIWindowScene.self
        configuration.delegateClass = GalleryCaptureScene.self
        return configuration
    }
}

@MainActor
final class GalleryCaptureScene: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?
    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        let window = UIWindow(windowScene: windowScene)
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
    }
}
