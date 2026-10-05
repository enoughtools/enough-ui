# EnoughUI for Swift

A SwiftUI design system for **macOS 13+ and iOS/iPadOS 16+**, distributed as the `EnoughUI` Swift package. Swift 5.9+ is required. No third-party runtime dependencies, downloaded fonts, or application services are included.

EnoughUI brings the same paper surfaces, fine rules, proportional typography, square content containers and indigo accents to Apple apps. It builds on SwiftUI's native controls and accessibility. System pickers, switches, menus, calendars and presentation chrome keep their platform shapes and behavior.

## Install

In Xcode, choose **File → Add Package Dependencies**, enter `https://github.com/enoughtools/enough-ui.git`, select a release containing the Swift package (0.5.0 or later), and add the **EnoughUI** product to your app target.

For a Swift package:

```swift
// Package.swift
 dependencies: [
     .package(url: "https://github.com/enoughtools/enough-ui.git", from: "0.5.0")
 ],
 targets: [
     .target(name: "MyApp", dependencies: [
         .product(name: "EnoughUI", package: "enough-ui")
     ])
 ]
```

The repository-root `Package.swift` points into `packages/swift/`. SwiftPM downloads sources from the Git release tag; installing the Swift library does not require npm, React, Astro, Node, or a separate registry account. All renderers share EnoughUI's `v<version>` release tags.

For development, use `.package(name: "EnoughUI", path: "/absolute/path/to/enough-ui")`. The independent [native examples](../../examples/swift-catalog/) use this path-based integration.

## Build a screen

```swift
import SwiftUI
import EnoughUI

struct ProfileView: View {
    @State private var name = ""
    @State private var updates = true

    var body: some View {
        EnoughThemeProvider {
            EnoughCard {
                EnoughCardHeader("Profile", description: "Make yourself at home.")
                EnoughField("Name", description: "Your preferred name.") {
                    EnoughTextField("Name", text: $name)
                }
                EnoughCheckbox("Send me updates", isOn: $updates)
                EnoughButton("Save", variant: .primary) { save() }
            }.padding()
        }
    }
    private func save() { /* Your application's command. */ }
}
```

Controls use bindings: the application owns state, validation, persistence, commands, destinations, permissions and network requests. Option identities and tags must be unique and stable. Native modifiers such as `.disabled`, `.onSubmit`, `.keyboardShortcut`, `.focused`, `.textContentType`, `.contextMenu` and accessibility modifiers compose with the views where SwiftUI supports them. Set a keyboard shortcut on `EnoughButton` itself or use a native `Button` with `EnoughButtonStyle` for the fullest native API.

## Component coverage

This is a bounded native library, not a claim of React/Radix API or behavioral parity. Xcode examples demonstrate every view below. Use native equivalents for the final group rather than wrapping them merely to rename them.

| Family | Public Swift API | Behavior |
| --- | --- | --- |
| Theme and foundations | `EnoughThemeProvider`, `EnoughTheme`, `EnoughPalette`, `EnoughTone` | System appearance or explicit theme; generated shared palette |
| Typography | `EnoughHeading`, `EnoughEyebrow`, `EnoughKeyboardHint` | Semantic text styles, serif headings, proportional hints |
| Buttons | `EnoughButton`, `EnoughIconButton`, `EnoughButtonStyle`, `EnoughButtonGroup` | Primary, secondary, accent, outline, ghost, destructive; small/regular/large |
| Input | `EnoughTextField`, `EnoughSecureField`, `EnoughTextFieldStyle`, `EnoughTextEditor`, `EnoughSearchField` | Native editing, secure entry, clear search |
| Form field | `EnoughField` | Label, description and app-provided error, accessible guidance |
| Boolean selection | `EnoughCheckbox`, `EnoughSwitch`, `EnoughToggle` | Native checkbox on macOS; labelled button-style checkbox on iOS; native switch |
| Choice | `EnoughSelect`, `EnoughSegmentedControl`, `EnoughRadioGroup` | Native Picker; radio-group on macOS, inline Picker on iOS |
| Searchable selection | `EnoughCombobox`, `EnoughOption` | Optional selected ID, searchable sheet, no-results state, native dismissal |
| Range and dates | `EnoughSlider`, `EnoughDatePicker`, `EnoughCalendar` | Native range control, bounded date entry and graphical calendar |
| Content | `EnoughCard`, `EnoughCardHeader`, `EnoughItem`, `EnoughBadge`, `EnoughAvatar` | Composable surfaces, actions, initial fallback and optional remote image |
| Status | `EnoughAlert`, `EnoughEmptyState`, `EnoughToast` | Neutral/accent/success/warning/danger; persistent dismissible toast |
| Loading | `EnoughProgress`, `EnoughSpinner`, `EnoughSkeleton` | Native determinate/indeterminate progress; static skeleton |
| Layout | `EnoughSeparator`, `EnoughAspectRatio`, `EnoughScrollArea`, `EnoughAccordion` | Composable layout; controlled native DisclosureGroup |
| Navigation | `EnoughNavigation`, `EnoughTabs`, `EnoughBreadcrumbs`, `EnoughBreadcrumb`, `EnoughPagination` | Native split navigation and tabs; links; one-based controlled pages |
| Presentations | `.enoughSheet`, `.enoughPopover`, `.enoughAlert`, `.enoughConfirmationDialog`, `.enoughTooltip` | Native presentation and help; sheets/popovers inherit the theme |
| Native composition | SwiftUI `Table`, `Grid`, `List`, `Chart`, `.contextMenu`, `ToolbarItem`, `HSplitView`, `.fileImporter`, `.fileExporter` | Use directly inside the theme; consuming app defines data and actions |

Native `Table` supplies sorting and selection on macOS; choose `List` or `Grid` for a narrow iPhone layout. Swift Charts is Apple's chart library on the supported OS versions. Use a `TabView` with `.tabViewStyle(.page)` for an iOS carousel. These are platform capabilities, not EnoughUI exports. Rich editors, OTP workflows, maps, drag/drop frameworks and product-specific chat/questionnaire components are outside this release.

### Pickers and selection

```swift
EnoughSelect("Workspace", selection: $workspace) {
    Text("Personal").tag("personal")
    Text("Team").tag("team")
}
EnoughCombobox("Choose a team", selection: $teamID, options: [
    EnoughOption("design", title: "Design"),
    EnoughOption("engineering", title: "Engineering")
])
```

`teamID` is optional; `workspace` is a nonoptional String. The caller owns reconciliation when options disappear. Pagination uses `1...totalPages`; use page 1 and totalPages 0 for an empty data set and update the page when its total changes. No component fetches or paginates data itself. Sliders are continuous by default; pass a positive `step` for discrete values. Progress totals must be positive, and values are clamped to the valid interval.

## Appearance and fonts

The default theme follows the system. `EnoughThemeProvider(theme: .dark)` or `.light` overrides it, including native control appearance. Custom themes specify a `colorScheme` and semantic colors. A descendant can read `@Environment(\.enoughTheme)` to style custom compositions.

The palette is generated from `src/styles/styles.css` by `node scripts/build-swift-tokens.mjs`. Dark foregrounds use the existing dark web tokens; additional native semantic danger/dark-surface colors are explicit in `Theme.swift`. CI checks palette freshness. The library uses the system proportional body font and system serif headings. To match the web fonts exactly, the app can bundle licensed Space Grotesk and Libre Caslon Text font files, register them normally, and supply their PostScript names:

```swift
var theme = EnoughTheme.light
 theme.bodyFontName = "SpaceGrotesk-Regular"
 theme.headingFontName = "LibreCaslonText-Regular"
```

Fonts scale through semantic text styles. Content containers and custom buttons have square edges; system controls and modals retain Apple styling. Skeletons do not animate, and the library introduces no mandatory transitions. Decorative glyphs and dividers are hidden from accessibility. Status uses both text and symbols; color is supplementary. Icon buttons require a label. SwiftUI controls handle their native focus and keyboard semantics. The app remains responsible for VoiceOver announcements for asynchronous status, sufficient contrast in custom themes, content localization, and testing complete workflows.

## Examples and verification

```sh
swift run --package-path examples/swift-catalog EnoughUICatalog
swift test
swift test -Xswiftc -swift-version -Xswiftc 6
swift build --package-path examples/swift-catalog
xcodebuild -scheme EnoughUI -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
node scripts/build-swift-tokens.mjs --check
```

Open the native example source in Xcode for light, dark and narrow previews. This is a local native example, not another public showcase website; the existing Storybook remains the web catalog.

Tests cover system appearance resolution and overrides and render actual AppKit-backed controls in light/dark and narrow layouts with accessible text settings. Rendered PNGs appear in `artifacts/swift/`. macOS does not apply iOS Dynamic Type scaling uniformly; verify iPhone/iPad accessibility sizes in the simulator as well. Tests do not establish exhaustive VoiceOver, keyboard or modal interaction coverage. The independent example checks public imports and compilation, and CI builds the iOS simulator library.

## RepoReach migration

RepoReach's `ReachTheme` and `ReachButtonStyle` were visual references. This package does not import RepoReach or its services. A gradual adoption can replace `ReachButtonStyle(kind: .primary)` with `EnoughButtonStyle(.primary)`, quiet with ghost, and its divider and eyebrow with `EnoughSeparator` and `EnoughEyebrow`. Product URLs, byte formatting, branding marks and commands stay in RepoReach. RepoReach adoption is a separate change; no product files are modified by this release.

## Distribution

Swift Package Manager is the supported installation method. Swift Package Index is a discovery/build/documentation service rather than an additional package manager. After the first public release, submit `https://github.com/enoughtools/enough-ui.git` using its [add-package workflow](https://swiftpackageindex.com/add-a-package). Acceptance is controlled by the index maintainers.

CocoaPods is not a release target: its maintainers [plan to make trunk read-only in December 2026](https://blog.cocoapods.org/CocoaPods-Specs-Repo/). Carthage framework distribution and prebuilt XCFrameworks add no benefit for this source-only SwiftUI package. There is no Homebrew formula because this is an app library, not a command-line application.

MIT; see the repository [license](../../LICENSE) and [notices](../../THIRD_PARTY_NOTICES.md).
