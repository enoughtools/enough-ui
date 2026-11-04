// gallery: {"id": "text-editor", "title": "Text editor", "category": "Forms", "description": "A native multiline editor for notes and longer answers.", "type": "TextEditorGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct TextEditorGalleryExample: View {
    @State private var notes = "Fine rules, paper surfaces, clear type.\nA shared foundation for Apple apps."

    var body: some View {
        EnoughField("Notes", description: "A little context goes a long way.") {
            EnoughTextEditor("Notes", text: $notes, minimumHeight: 160)
        }
    }
}
