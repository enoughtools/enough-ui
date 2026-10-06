// gallery: {"id": "empty-state", "title": "Empty states", "category": "Feedback", "description": "A helpful next step when there is nothing to show.", "type": "EmptyStateGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct EmptyStateGalleryExample: View {
    var body: some View {
        EnoughEmptyState("No projects yet", description: "Create a project to get started.", systemImage: "tray") {
            EnoughButton("Create project", variant: .primary) {}
        }
    }
}
