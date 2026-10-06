// gallery: {"id": "typography", "title": "Typography", "category": "Content", "description": "Serif headings and proportional type at every size.", "type": "TypographyGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct TypographyGalleryExample: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            EnoughEyebrow("Enough to build on")
            EnoughHeading("Make yourself at home.")
            Text("Fine rules. Paper surfaces. Clear type.")
            EnoughKeyboardHint("⌘ K")
        }
    }
}
