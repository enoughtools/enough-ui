import XCTest
import SwiftUI
@testable import EnoughUI
#if os(macOS)
import AppKit
#endif

final class EnoughUITests: XCTestCase {
    func testSystemAppearanceAndExplicitOverride() {
        var environment = EnvironmentValues()
        environment.colorScheme = .dark
        XCTAssertEqual(environment.enoughTheme.text, EnoughTheme.dark.text)
        environment.colorScheme = .light
        XCTAssertEqual(environment.enoughTheme.text, EnoughTheme.light.text)
        var custom = EnoughTheme.light
        custom.accent = .pink
        environment.enoughTheme = custom
        environment.colorScheme = .dark
        XCTAssertEqual(environment.enoughTheme.accent, Color.pink)
    }

    @MainActor
    func testNativeControlsRenderAcrossAppearancesAndAccessibleTextSizes() throws {
        #if os(macOS)
        let directory = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
            .appendingPathComponent("artifacts/swift")
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        for (name, theme, size, width) in [
            ("light", EnoughTheme.light, DynamicTypeSize.large, CGFloat(760)),
            ("dark", EnoughTheme.dark, DynamicTypeSize.large, CGFloat(760)),
            ("accessible-narrow", EnoughTheme.light, DynamicTypeSize.accessibility3, CGFloat(360))
        ] {
            // ImageRenderer cannot draw AppKit-backed native controls; host real views.
            let root = EnoughThemeProvider(theme: theme) {
                RenderFixture().padding(24).frame(width: width).fixedSize(horizontal: false, vertical: true)
            }.environment(\.dynamicTypeSize, size)
            let host = NSHostingView(rootView: root)
            host.frame = NSRect(x: 0, y: 0, width: width, height: 1800)
            let window = NSWindow(contentRect: host.frame, styleMask: [.borderless], backing: .buffered, defer: false)
            window.contentView = host
            host.layoutSubtreeIfNeeded()
            host.setFrameSize(host.fittingSize)
            host.layoutSubtreeIfNeeded()
            let bitmap = try XCTUnwrap(host.bitmapImageRepForCachingDisplay(in: host.bounds))
            host.cacheDisplay(in: host.bounds, to: bitmap)
            XCTAssertGreaterThanOrEqual(bitmap.pixelsWide, Int(width))
            XCTAssertGreaterThan(bitmap.pixelsHigh, 500)
            let png = try XCTUnwrap(bitmap.representation(using: .png, properties: [:]))
            XCTAssertGreaterThan(png.count, 1000)
            try png.write(to: directory.appendingPathComponent("\(name).png"))
            window.contentView = nil
        }
        #endif
    }
}

private struct RenderFixture: View {
    @State private var text = "Morgan"
    @State private var enabled = true
    @State private var selection = 0
    @State private var expanded = true
    @State private var progress = 0.5
    @State private var page = 1
    @State private var date = Date(timeIntervalSince1970: 1_780_000_000)
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            EnoughEyebrow("Enough to build on")
            EnoughHeading("Native, familiar, Enough.")
            EnoughCard {
                EnoughCardHeader("Profile", description: "A shared language for Apple apps.") { EnoughBadge("Ready", tone: .success) }
                EnoughItem("Morgan Lee", description: "Design team") {
                    EnoughAvatar("Morgan Lee")
                } trailing: { EnoughKeyboardHint("⌘ K") }
                EnoughField("Name", description: "Use your preferred name.") { EnoughTextField("Name", text: $text) }
                EnoughField("Email", error: "Enter a valid email address.") { EnoughTextField("Email", text: $text) }
                EnoughSecureField("Password", text: $text)
                EnoughSearchField(text: $text)
                EnoughCheckbox("Receive updates", isOn: $enabled)
                EnoughSwitch("Sync changes", isOn: $enabled)
                EnoughSegmentedControl("Plan", selection: $selection) { Text("Personal").tag(0); Text("Team").tag(1) }
                EnoughRadioGroup("Plan", selection: $selection) { Text("Personal").tag(0); Text("Team").tag(1) }
                EnoughSelect("Plan", selection: $selection) { Text("Personal").tag(0); Text("Team").tag(1) }
                EnoughSlider("Progress", value: $progress)
                EnoughDatePicker("Due date", selection: $date)
                ViewThatFits {
                    HStack { actions }
                    VStack(alignment: .leading) { actions }
                }
            }
            EnoughAlert("Saved successfully", tone: .success) { Text("Your profile is up to date.") }
            EnoughAlert("Connection lost", tone: .danger) { Text("Try again shortly.") }
            EnoughAccordion(isExpanded: $expanded) { Text("Content uses proportional type and square surfaces.") }
                label: { Text("Details") }
            EnoughProgress("Uploading", value: 0.15, total: 0.3)
            EnoughPagination(page: $page, totalPages: 5)
            EnoughSkeleton(width: 160)
            EnoughSeparator()
            EnoughEmptyState("No more items", description: "You are all caught up.")
        }
    }
    @ViewBuilder private var actions: some View {
        EnoughButton("Save", variant: .primary) {}
        EnoughButton("Cancel") {}
        EnoughButton("Delete", variant: .destructive) {}
        EnoughButton("Disabled", variant: .outline) {}.disabled(true)
    }
}
