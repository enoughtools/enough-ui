// gallery: {"id": "combobox", "title": "Searchable selection", "category": "Forms", "description": "Search a set of options in a native sheet.", "type": "ComboboxGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct ComboboxGalleryExample: View {
    @State private var team: String? = "design"

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            EnoughHeading("Choose a discipline", style: .title2)
            EnoughCombobox("Team", selection: $team, options: [
                EnoughOption("design", title: "Design"),
                EnoughOption("engineering", title: "Engineering"),
                EnoughOption("operations", title: "Operations")
            ])
            Text("Open the native demo to search and select.").font(.callout)
        }
    }
}
