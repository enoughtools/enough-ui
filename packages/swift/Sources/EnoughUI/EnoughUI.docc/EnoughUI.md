# ``EnoughUI``

Build Apple apps with Enough's paper surfaces, fine rules, proportional type, square containers and indigo accents.

## Overview

EnoughUI supports macOS 13 and iOS/iPadOS 16 or later. Install the `EnoughUI` library product with Swift Package Manager from `https://github.com/enoughtools/enough-ui.git`.

Wrap a screen with ``EnoughThemeProvider`` and compose components using ordinary SwiftUI bindings and view builders. The default theme follows the system appearance. Use ``EnoughTheme/light`` or ``EnoughTheme/dark`` for an explicit appearance. Application commands, data, validation and navigation destinations belong to the consuming app.

```swift
import SwiftUI
import EnoughUI

struct Example: View {
    @State private var name = ""
    var body: some View {
        EnoughThemeProvider {
            EnoughCard {
                EnoughCardHeader("Profile")
                EnoughField("Name") {
                    EnoughTextField("Name", text: $name)
                }
                EnoughButton("Save", variant: .primary) { }
            }.padding()
        }
    }
}
```

System controls retain their native shapes, editing, keyboard and accessibility behavior. EnoughUI supplies content surfaces and styles rather than reimplementing the platform. Use SwiftUI Table, List, Grid, Charts, context menus, split views, file importers and exporters directly where they fit. Radio groups use native radio buttons on macOS and inline pickers on iOS. Tooltip help follows platform support. The Swift API is independent of the web component API.

No third-party runtime dependencies or remote fonts are required. Apps can register and provide their own proportional font names through the theme. The shared palette comes from EnoughUI's web theme; native semantic colors adapt it for light and dark appearances.

## Topics

### Theme

- ``EnoughThemeProvider``
- ``EnoughTheme``
- ``EnoughPalette``
- ``EnoughTone``

### Actions

- ``EnoughButton``
- ``EnoughButtonStyle``
- ``EnoughButtonVariant``
- ``EnoughControlSize``
- ``EnoughIconButton``
- ``EnoughButtonGroup``
- ``EnoughMenu``
- ``EnoughToggle``

### Forms and selection

- ``EnoughField``
- ``EnoughTextField``
- ``EnoughSecureField``
- ``EnoughTextFieldStyle``
- ``EnoughTextEditor``
- ``EnoughSearchField``
- ``EnoughCheckbox``
- ``EnoughSwitch``
- ``EnoughSelect``
- ``EnoughSegmentedControl``
- ``EnoughRadioGroup``
- ``EnoughCombobox``
- ``EnoughOption``
- ``EnoughSlider``
- ``EnoughDatePicker``
- ``EnoughCalendar``

### Content and feedback

- ``EnoughHeading``
- ``EnoughEyebrow``
- ``EnoughCard``
- ``EnoughCardHeader``
- ``EnoughItem``
- ``EnoughBadge``
- ``EnoughAvatar``
- ``EnoughAlert``
- ``EnoughEmptyState``
- ``EnoughToast``
- ``EnoughProgress``
- ``EnoughSpinner``
- ``EnoughSkeleton``
- ``EnoughKeyboardHint``

### Layout and navigation

- ``EnoughSeparator``
- ``EnoughAspectRatio``
- ``EnoughScrollArea``
- ``EnoughAccordion``
- ``EnoughNavigation``
- ``EnoughTabs``
- ``EnoughBreadcrumbs``
- ``EnoughBreadcrumb``
- ``EnoughPagination``
