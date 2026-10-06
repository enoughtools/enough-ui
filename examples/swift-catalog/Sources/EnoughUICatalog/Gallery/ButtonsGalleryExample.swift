// gallery: {"id": "buttons", "title": "Buttons", "category": "Actions", "description": "Square actions, clear hierarchy, native activation.", "type": "ButtonsGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct ButtonsGalleryExample: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            EnoughButton("Save changes", variant: .primary) {}
            EnoughButtonGroup {
                EnoughButton("Previous", size: .small) {}
                EnoughButton("Next", size: .small) {}
            }
            HStack {
                EnoughButton("Outline", variant: .outline) {}
                EnoughButton("Delete", variant: .destructive) {}
            }
            EnoughButton("Unavailable", variant: .primary) {}.disabled(true)
            EnoughIconButton("Add item", systemImage: "plus") {}
        }
    }
}
