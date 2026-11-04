// gallery: {"id": "presentations", "title": "Sheets & dialogs", "category": "Actions", "description": "Themed sheets and popovers with native alerts and confirmations.", "type": "PresentationsGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct PresentationsGalleryExample: View {
    @State private var sheet = false
    @State private var popover = false
    @State private var alert = false
    @State private var confirm = false

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            EnoughHeading("A little more room", style: .title2)
            EnoughButton("Open sheet") { sheet = true }
            EnoughButton("Open popover") { popover = true }
                .enoughPopover(isPresented: $popover) { Text("Helpful context.") }
            EnoughButton("Show alert") { alert = true }
            EnoughButton("Choose an action") { confirm = true }
        }
        .enoughSheet(isPresented: $sheet) {
            VStack(spacing: 16) {
                EnoughHeading("Make yourself at home.")
                EnoughButton("Done", variant: .primary) { sheet = false }
            }
        }
        .enoughAlert("Your work is saved", isPresented: $alert) {
            Button("Done", role: .cancel) {}
        } message: { Text("Everything is up to date.") }
        .enoughConfirmationDialog("Choose an action", isPresented: $confirm) {
            Button("Save") {}
            Button("Cancel", role: .cancel) {}
        }
    }
}
