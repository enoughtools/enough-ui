// gallery: {"id": "slider", "title": "Sliders", "category": "Forms", "description": "A continuous range control with native keyboard behavior.", "type": "SliderGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct SliderGalleryExample: View {
    @State private var volume = 0.6

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            EnoughHeading("Make it comfortable", style: .title2)
            EnoughSlider("Volume", value: $volume)
            Text("Volume: \(Int(volume * 100))%")
        }
    }
}
