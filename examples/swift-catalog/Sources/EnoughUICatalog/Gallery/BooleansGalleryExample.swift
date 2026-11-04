// gallery: {"id": "booleans", "title": "Checkboxes & switches", "category": "Forms", "description": "Native booleans and a button-style selection.", "type": "BooleansGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct BooleansGalleryExample: View {
    @State private var updates = true
    @State private var sync = false
    @State private var pinned = true

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            EnoughCheckbox("Email updates", isOn: $updates)
            EnoughSwitch("Sync automatically", isOn: $sync)
            EnoughToggle("Pinned", isOn: $pinned)
        }
    }
}
