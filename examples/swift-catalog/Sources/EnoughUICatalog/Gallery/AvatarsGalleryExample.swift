// gallery: {"id": "avatars", "title": "Avatars & items", "category": "Content", "description": "Square avatars with initials and composed content rows.", "type": "AvatarsGalleryExample", "height": 340}
import SwiftUI
import EnoughUI

struct AvatarsGalleryExample: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            EnoughItem("Morgan Lee", description: "Design team") {
                EnoughAvatar("Morgan Lee")
            } trailing: { EnoughBadge("Online", tone: .success) }
            EnoughSeparator()
            EnoughItem("Taylor Kim", description: "Engineering") {
                EnoughAvatar("Taylor Kim")
            } trailing: { EnoughIconButton("More options", systemImage: "ellipsis") {} }
        }
    }
}
