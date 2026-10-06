// gallery: {"id": "charts", "title": "Native charts", "category": "Content", "description": "Apple Charts composed with EnoughUI colors and type.", "type": "ChartsGalleryExample", "height": 340}
import SwiftUI
import EnoughUI
import Charts

struct ChartsGalleryExample: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            EnoughHeading("A week of good work", style: .title2)
            Chart {
                BarMark(x: .value("Day", "Mon"), y: .value("Projects", 4))
                BarMark(x: .value("Day", "Tue"), y: .value("Projects", 7))
                BarMark(x: .value("Day", "Wed"), y: .value("Projects", 5))
                BarMark(x: .value("Day", "Thu"), y: .value("Projects", 9))
                BarMark(x: .value("Day", "Fri"), y: .value("Projects", 6))
            }.foregroundStyle(Color.enoughRGB(EnoughPalette.accent)).frame(height: 180)
        }
    }
}
