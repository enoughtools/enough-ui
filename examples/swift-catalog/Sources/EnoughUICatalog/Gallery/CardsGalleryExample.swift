// gallery: {"id": "cards", "title": "Cards", "category": "Content", "description": "Composable paper surfaces for content and actions.", "type": "CardsGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct CardsGalleryExample: View {
    var body: some View {
        EnoughCard {
            EnoughCardHeader("Your workspace", description: "A little room to do good work.") {
                EnoughBadge("Personal", tone: .accent)
            }
            EnoughItem("Design foundations", description: "Shared across every product.")
            EnoughSeparator()
            EnoughButton("Open workspace", variant: .primary) {}
        }
    }
}
