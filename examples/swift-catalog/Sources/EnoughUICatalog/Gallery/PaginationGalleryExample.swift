// gallery: {"id": "pagination", "title": "Pagination", "category": "Navigation", "description": "One-based pages with native, labelled navigation buttons.", "type": "PaginationGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct PaginationGalleryExample: View {
    @State private var page = 2

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            EnoughHeading("A little at a time", style: .title2)
            EnoughPagination(page: $page, totalPages: 5)
            Text("Your app owns the page data.").font(.callout)
        }
    }
}
