// gallery: {"id": "navigation", "title": "Navigation & tabs", "category": "Navigation", "description": "Native destinations, tab selection and breadcrumb links.", "type": "NavigationGalleryExample", "height": 800}
import SwiftUI
import EnoughUI

struct NavigationGalleryExample: View {
    @State private var tab = 0

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            EnoughBreadcrumbs([
                EnoughBreadcrumb(id: "home", title: "EnoughUI", destination: URL(string: "https://ui.enoughtools.com")),
                EnoughBreadcrumb(id: "swift", title: "Swift")
            ])
            EnoughTabs(selection: $tab) {
                Text("A place for your projects.").tabItem { Label("Overview", systemImage: "rectangle.grid.1x2") }.tag(0)
                Text("Recent activity.").tabItem { Label("Activity", systemImage: "clock") }.tag(1)
            }.frame(height: 130)
            EnoughNavigation {
                List { Text("Projects"); Text("Settings") }
            } detail: { Text("Your workspace") }.frame(height: 460)
        }
    }
}
