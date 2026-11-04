import SwiftUI
import EnoughUI

enum GalleryExample: String, CaseIterable, Identifiable {
    case buttons = "buttons"
    case typography = "typography"
    case cards = "cards"
    case badges = "badges"
    case avatars = "avatars"
    case alerts = "alerts"
    case empty_state = "empty-state"
    case inputs = "inputs"
    case text_editor = "text-editor"
    case search = "search"
    case booleans = "booleans"
    case pickers = "pickers"
    case combobox = "combobox"
    case dates = "dates"
    case slider = "slider"
    case accordion = "accordion"
    case progress = "progress"
    case navigation = "navigation"
    case pagination = "pagination"
    case layout = "layout"
    case toast = "toast"
    case presentations = "presentations"
    case menus = "menus"
    case charts = "charts"
    var id: String { rawValue }
    var title: String {
        switch self {
        case .buttons: return "Buttons"
        case .typography: return "Typography"
        case .cards: return "Cards"
        case .badges: return "Badges"
        case .avatars: return "Avatars & items"
        case .alerts: return "Alerts"
        case .empty_state: return "Empty states"
        case .inputs: return "Text fields"
        case .text_editor: return "Text editor"
        case .search: return "Search fields"
        case .booleans: return "Checkboxes & switches"
        case .pickers: return "Pickers"
        case .combobox: return "Searchable selection"
        case .dates: return "Dates & calendars"
        case .slider: return "Sliders"
        case .accordion: return "Accordions"
        case .progress: return "Progress & loading"
        case .navigation: return "Navigation & tabs"
        case .pagination: return "Pagination"
        case .layout: return "Layout & media"
        case .toast: return "Notifications"
        case .presentations: return "Sheets & dialogs"
        case .menus: return "Menus & tooltips"
        case .charts: return "Native charts"
        }
    }
    var height: CGFloat { self == .navigation ? 800 : self == .dates ? 470 : 340 }
}

struct GalleryFixture: View {
    let example: GalleryExample
    var body: some View {
        Group {
            switch example {
            case .buttons: ButtonsGalleryExample()
            case .typography: TypographyGalleryExample()
            case .cards: CardsGalleryExample()
            case .badges: BadgesGalleryExample()
            case .avatars: AvatarsGalleryExample()
            case .alerts: AlertsGalleryExample()
            case .empty_state: EmptyStateGalleryExample()
            case .inputs: InputsGalleryExample()
            case .text_editor: TextEditorGalleryExample()
            case .search: SearchGalleryExample()
            case .booleans: BooleansGalleryExample()
            case .pickers: PickersGalleryExample()
            case .combobox: ComboboxGalleryExample()
            case .dates: DatesGalleryExample()
            case .slider: SliderGalleryExample()
            case .accordion: AccordionGalleryExample()
            case .progress: ProgressGalleryExample()
            case .navigation: NavigationGalleryExample()
            case .pagination: PaginationGalleryExample()
            case .layout: LayoutGalleryExample()
            case .toast: ToastGalleryExample()
            case .presentations: PresentationsGalleryExample()
            case .menus: MenusGalleryExample()
            case .charts: ChartsGalleryExample()
            }
        }.frame(maxWidth: .infinity, alignment: .leading).padding(24)
    }
}

struct GalleryDemo: View {
    @State private var selection: GalleryExample? = .buttons
    var body: some View {
        EnoughThemeProvider {
            NavigationSplitView {
                List(GalleryExample.allCases, selection: $selection) { example in
                    Text(example.title).tag(example)
                }.navigationTitle("EnoughUI")
            } detail: {
                ScrollView {
                    if let selection {
                        VStack(alignment: .leading) {
                            EnoughHeading(LocalizedStringKey(selection.title)).padding(24)
                            GalleryFixture(example: selection)
                        }
                    }
                }.frame(minWidth: 340)
            }
        }
    }
}
