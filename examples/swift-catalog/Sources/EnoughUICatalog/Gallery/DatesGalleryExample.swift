// gallery: {"id": "dates", "title": "Dates & calendars", "category": "Forms", "description": "Bounded date entry and a native graphical calendar.", "type": "DatesGalleryExample", "height": 470}
import SwiftUI
import EnoughUI

struct DatesGalleryExample: View {
    @State private var date = Date(timeIntervalSince1970: 1791201600)

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            EnoughDatePicker("Due date", selection: $date)
            EnoughCalendar("Schedule", selection: $date)
        }
    }
}
