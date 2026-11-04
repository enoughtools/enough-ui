// gallery: {"id": "badges", "title": "Badges", "category": "Content", "description": "Compact status labels with text and semantic color.", "type": "BadgesGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct BadgesGalleryExample: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            EnoughBadge("Draft")
            EnoughBadge("In progress", tone: .accent)
            EnoughBadge("Ready", tone: .success)
            EnoughBadge("Needs attention", tone: .warning)
            EnoughBadge("Failed", tone: .danger)
        }
    }
}
