import SwiftUI
import EnoughUI

@main
struct EnoughUICatalogApp: App {
    var body: some Scene { WindowGroup { Catalog().frame(minWidth: 340, idealWidth: 760, minHeight: 500) } }
}

/// Native examples share one view for the runnable catalog and Xcode previews.
struct Catalog: View {
    @State private var name = "Morgan"
    @State private var password = ""
    @State private var notes = "Fine rules, paper surfaces, clear type."
    @State private var search = ""
    @State private var enabled = true
    @State private var expanded = true
    @State private var volume = 0.6
    @State private var choice = "personal"
    @State private var tab = 0
    @State private var page = 1
    @State private var date = Date()
    @State private var selection: String? = "design"
    @State private var showToast = false
    @State private var showSheet = false
    @State private var showPopover = false
    @State private var showAlert = false
    @State private var showConfirmation = false
    @State private var dark = false

    init(dark: Bool = false) { _dark = State(initialValue: dark) }

    var body: some View {
        EnoughThemeProvider(theme: dark ? .dark : .light) {
            EnoughScrollArea {
                VStack(alignment: .leading, spacing: 24) {
                    header
                    actions
                    presentation
                    forms
                    selectionControls
                    navigation
                    feedback
                    media
                }.padding(24).frame(maxWidth: 800)
            }
        }
    }
    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            EnoughEyebrow("Enough to build on")
            EnoughHeading("EnoughUI for Swift")
            Text("Native controls. A shared visual language.")
            EnoughSwitch("Dark appearance", isOn: $dark)
        }
    }
    private var actions: some View {
        EnoughCard {
            EnoughCardHeader("Actions", description: "Buttons preserve native focus and activation.")
            ViewThatFits {
                HStack { buttonVariants }
                VStack(alignment: .leading) { buttonVariants }
            }
            EnoughButton("Disabled", variant: .primary) {}.disabled(true)
            EnoughButtonGroup {
                EnoughButton("Previous", size: .small) {}
                EnoughButton("Next", size: .small) {}
            }
            EnoughToggle("Pinned", isOn: $enabled)
            EnoughMenu {
                Button("Save") { showToast = true }
                Button("Delete", role: .destructive) { showAlert = true }
            } label: { Label("More", systemImage: "ellipsis") }
            EnoughIconButton("Add item", systemImage: "plus") { showToast = true }
                .enoughTooltip("Add a new item")
        }
    }
    @ViewBuilder private var buttonVariants: some View {
        EnoughButton("Primary", variant: .primary) { showToast = true }
        EnoughButton("Secondary") { showToast = true }
        EnoughButton("Outline", variant: .outline) { showToast = true }
        EnoughButton("Ghost", variant: .ghost) { showToast = true }
        EnoughButton("Delete", variant: .destructive) { showAlert = true }
    }
    private var presentation: some View {
        EnoughCard {
            EnoughCardHeader("Content") { EnoughBadge("Ready", tone: .success) }
            EnoughItem("Design system", description: "Shared foundations for every product.") {
                EnoughAvatar("Enough Tools")
            } trailing: { EnoughKeyboardHint("⌘ K") }
            EnoughSeparator()
            EnoughAlert("Your work is saved", tone: .success) { Text("Changes are available on this device.") }
            EnoughAlert("Check your connection", tone: .warning) { Text("Some changes are still waiting to sync.") }
            EnoughAlert("Unable to save", tone: .danger) { Text("Try again when your connection returns.") }
            EnoughAccordion(isExpanded: $expanded) { Text("Build on native SwiftUI rather than replacing platform behavior.") }
                label: { Text("Why SwiftUI?") }
            EnoughEmptyState("No projects yet", description: "Create a project to get started.") {
                EnoughButton("Create project", variant: .primary) { showToast = true }
            }
        }
    }
    private var forms: some View {
        EnoughCard {
            EnoughCardHeader("Forms")
            EnoughField("Name", description: "This appears on your profile.") {
                EnoughTextField("Name", text: $name, prompt: "Your name")
            }
            EnoughField("Password", error: password.count < 8 ? "Use at least eight characters." : nil) {
                EnoughSecureField("Password", text: $password)
            }
            EnoughTextEditor("Notes", text: $notes)
            EnoughSearchField(text: $search)
            EnoughCheckbox("Email updates", isOn: $enabled)
            EnoughSwitch("Sync automatically", isOn: $enabled)
            EnoughSlider("Volume", value: $volume)
            EnoughDatePicker("Due date", selection: $date)
        }
    }
    private var selectionControls: some View {
        EnoughCard {
            EnoughCardHeader("Selection")
            EnoughSelect("Workspace", selection: $choice) {
                Text("Personal").tag("personal"); Text("Team").tag("team")
            }
            EnoughSegmentedControl("Workspace", selection: $choice) {
                Text("Personal").tag("personal"); Text("Team").tag("team")
            }
            EnoughRadioGroup("Workspace", selection: $choice) {
                Text("Personal").tag("personal"); Text("Team").tag("team")
            }
            EnoughCombobox("Choose a discipline", selection: $selection, options: [
                EnoughOption("design", title: "Design"), EnoughOption("engineering", title: "Engineering")
            ])
            EnoughCalendar("Schedule", selection: $date)
        }
    }
    private var navigation: some View {
        EnoughCard {
            EnoughCardHeader("Navigation")
            EnoughBreadcrumbs([
                EnoughBreadcrumb(id: "home", title: "EnoughUI", destination: URL(string: "https://ui.enoughtools.com")),
                EnoughBreadcrumb(id: "swift", title: "Swift")
            ])
            EnoughTabs(selection: $tab) {
                Text("Overview content").tabItem { Label("Overview", systemImage: "rectangle.grid.1x2") }.tag(0)
                Text("Activity content").tabItem { Label("Activity", systemImage: "clock") }.tag(1)
            }.frame(height: 130)
            EnoughPagination(page: $page, totalPages: 5)
            EnoughNavigation {
                List { Text("Projects"); Text("Settings") }
            } detail: { Text("Select a destination") }.frame(height: 180)
        }
    }
    private var feedback: some View {
        EnoughCard {
            EnoughCardHeader("Feedback and presentations")
            EnoughProgress("Uploading", value: volume)
            EnoughSpinner()
            EnoughToast("Saved", isPresented: $showToast) { Text("Your settings were updated.") }
            HStack {
                EnoughButton("Open sheet") { showSheet = true }
                EnoughButton("Open popover") { showPopover = true }
                    .enoughPopover(isPresented: $showPopover) { Text("Helpful context.") }
                EnoughButton("Confirm") { showConfirmation = true }
            }
        }
        .enoughSheet(isPresented: $showSheet) {
            VStack(alignment: .leading, spacing: 16) {
                EnoughHeading("A native sheet")
                EnoughTextField("Name", text: $name)
                EnoughButton("Done", variant: .primary) { showSheet = false }
            }.frame(minWidth: 260)
        }
        .enoughAlert("Delete this item?", isPresented: $showAlert) {
            Button("Delete", role: .destructive) {}
            Button("Cancel", role: .cancel) {}
        } message: { Text("This example does not delete your data.") }
        .enoughConfirmationDialog("Choose an action", isPresented: $showConfirmation) {
            Button("Save") { showToast = true }
            Button("Cancel", role: .cancel) {}
        }
    }
    private var media: some View {
        EnoughCard {
            EnoughCardHeader("Media and loading")
            EnoughAspectRatio {
                Rectangle().fill(Color.enoughRGB(EnoughPalette.accentSoft))
                    .overlay { Image(systemName: "photo").font(.largeTitle) }
            }
            EnoughSkeleton(width: 180)
            EnoughSkeleton()
        }
    }
}

struct Catalog_Previews: PreviewProvider {
    static var previews: some View {
        Catalog().frame(width: 760, height: 900).previewDisplayName("EnoughUI · Light")
        Catalog(dark: true).preferredColorScheme(.dark).frame(width: 360, height: 800).previewDisplayName("EnoughUI · Narrow")
    }
}
