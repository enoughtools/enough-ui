// gallery: {"id": "pickers", "title": "Pickers", "category": "Forms", "description": "Menus, segments and platform-appropriate single choice.", "type": "PickersGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct PickersGalleryExample: View {
    @State private var workspace = "personal"

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            EnoughSelect("Workspace", selection: $workspace) {
                Text("Personal").tag("personal")
                Text("Team").tag("team")
            }
            EnoughSegmentedControl("Workspace", selection: $workspace) {
                Text("Personal").tag("personal")
                Text("Team").tag("team")
            }
            EnoughRadioGroup("Workspace", selection: $workspace) {
                Text("Personal").tag("personal")
                Text("Team").tag("team")
            }
        }
    }
}
