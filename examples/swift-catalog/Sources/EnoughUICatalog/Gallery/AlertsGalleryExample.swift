// gallery: {"id": "alerts", "title": "Alerts", "category": "Feedback", "description": "Status explained through text, symbols and color.", "type": "AlertsGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct AlertsGalleryExample: View {
    var body: some View {
        VStack(spacing: 12) {
            EnoughAlert("Your work is saved", tone: .success) { Text("Everything is up to date.") }
            EnoughAlert("Waiting to sync", tone: .warning) { Text("Connect to continue.") }
            EnoughAlert("Unable to save", tone: .danger) { Text("Try again shortly.") }
        }
    }
}
