// gallery: {"id": "inputs", "title": "Text fields", "category": "Forms", "description": "Native editing with labels, guidance and validation.", "type": "InputsGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct InputsGalleryExample: View {
    @State private var name = "Morgan"
    @State private var password = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            EnoughField("Name", description: "Your preferred name.") {
                EnoughTextField("Name", text: $name)
            }
            EnoughField("Password", error: "Use at least eight characters.") {
                EnoughSecureField("Password", text: $password)
            }
            TextField("Native styled field", text: $name).textFieldStyle(EnoughTextFieldStyle())
        }
    }
}
