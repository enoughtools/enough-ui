// gallery: {"id": "search", "title": "Search fields", "category": "Forms", "description": "Native text entry with a labelled clear action.", "type": "SearchGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct SearchGalleryExample: View {
    @State private var query = "Design"

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            EnoughHeading("Find your next project", style: .title2)
            EnoughSearchField("Search projects", text: $query)
            Text("Search updates the binding as you type.").font(.callout)
        }
    }
}
