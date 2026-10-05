// gallery: {"id": "menus", "title": "Menus & tooltips", "category": "Actions", "description": "Native menus, roles and platform help.", "type": "MenusGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct MenusGalleryExample: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            EnoughMenu {
                Button("Save") {}
                Button("Duplicate") {}
                Divider()
                Button("Delete", role: .destructive) {}
            } label: { Label("Project actions", systemImage: "ellipsis") }
            EnoughIconButton("Add project", systemImage: "plus") {}
                .enoughTooltip("Add a new project")
            Text("Try menus and help in the native demo.").font(.callout)
        }
    }
}
