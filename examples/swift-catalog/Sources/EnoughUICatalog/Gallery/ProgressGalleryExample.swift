// gallery: {"id": "progress", "title": "Progress & loading", "category": "Feedback", "description": "Native progress indicators and quiet loading placeholders.", "type": "ProgressGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct ProgressGalleryExample: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            EnoughProgress("Uploading", value: 0.6)
            EnoughSpinner("Preparing your workspace")
            EnoughSkeleton(width: 160)
            EnoughSkeleton()
        }
    }
}
