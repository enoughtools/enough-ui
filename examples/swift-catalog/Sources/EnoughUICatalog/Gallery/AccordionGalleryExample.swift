// gallery: {"id": "accordion", "title": "Accordions", "category": "Layout", "description": "Controlled disclosure built on the native DisclosureGroup.", "type": "AccordionGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct AccordionGalleryExample: View {
    @State private var expanded = true

    var body: some View {
        EnoughAccordion(isExpanded: $expanded) {
            Text("EnoughUI builds on native SwiftUI controls, with a shared visual language.")
        } label: { Text("What makes it Enough?") }
    }
}
