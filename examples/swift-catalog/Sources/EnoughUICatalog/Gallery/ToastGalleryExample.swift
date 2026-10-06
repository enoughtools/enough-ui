// gallery: {"id": "toast", "title": "Notifications", "category": "Feedback", "description": "Persistent feedback with an explicit dismiss action.", "type": "ToastGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct ToastGalleryExample: View {
    @State private var visible = true

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            EnoughToast("Saved", isPresented: $visible) { Text("Your settings were updated.") }
            EnoughButton("Show notification") { visible = true }
        }
    }
}
