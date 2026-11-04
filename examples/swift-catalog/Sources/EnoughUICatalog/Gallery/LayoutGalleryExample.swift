// gallery: {"id": "layout", "title": "Layout & media", "category": "Layout", "description": "Fine separators, proportional media and native scrolling.", "type": "LayoutGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct LayoutGalleryExample: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            EnoughAspectRatio {
                Rectangle().fill(Color.enoughRGB(EnoughPalette.accentSoft))
                    .overlay { Image(systemName: "photo").font(.largeTitle).foregroundStyle(Color.enoughRGB(EnoughPalette.accent)) }
            }.frame(maxHeight: 150)
            EnoughSeparator()
            EnoughScrollArea {
                VStack(alignment: .leading, spacing: 12) {
                    Text("A useful bit of context.")
                    Text("Scroll areas keep their native behavior.")
                }
            }.frame(height: 90)
        }
    }
}
