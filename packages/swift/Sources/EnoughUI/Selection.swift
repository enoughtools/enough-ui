import SwiftUI

/// An option with stable identity. Titles are user data rather than localization keys.
public struct EnoughOption<ID: Hashable>: Identifiable {
    public let id: ID
    public let title: String
    public init(_ id: ID, title: String) { self.id = id; self.title = title }
}

/// Searchable single selection using a native sheet and native buttons.
public struct EnoughCombobox<ID: Hashable>: View {
    private let title: LocalizedStringKey
    private let options: [EnoughOption<ID>]
    @Binding private var selection: ID?
    @State private var isPresented = false
    @State private var search = ""
    @Environment(\.enoughTheme) private var theme
    public init(_ title: LocalizedStringKey, selection: Binding<ID?>, options: [EnoughOption<ID>]) {
        self.title = title; _selection = selection; self.options = options
    }
    public var body: some View {
        EnoughButton {
            search = ""; isPresented = true
        } label: {
            HStack {
                if let selected = options.first(where: { $0.id == selection }) { Text(selected.title) }
                else { Text(title) }
                Image(systemName: "chevron.up.chevron.down").accessibilityHidden(true)
            }
        }.accessibilityLabel(Text(title))
            .accessibilityValue(Text(options.first(where: { $0.id == selection })?.title ?? ""))
            .enoughSheet(isPresented: $isPresented) {
                VStack(alignment: .leading, spacing: 16) {
                    HStack {
                        EnoughHeading(title, style: .title2)
                        Spacer()
                        EnoughIconButton("Close selection", systemImage: "xmark") { isPresented = false }
                    }
                    EnoughSearchField(text: $search)
                    ScrollView {
                        LazyVStack(alignment: .leading, spacing: 4) {
                            if matches.isEmpty { Text("No results").foregroundStyle(theme.muted) }
                            ForEach(matches) { option in
                                EnoughButton(variant: option.id == selection ? .primary : .ghost) {
                                    selection = option.id; isPresented = false
                                } label: {
                                    HStack {
                                        Text(option.title)
                                        Spacer()
                                        if option.id == selection { Image(systemName: "checkmark").accessibilityHidden(true) }
                                    }.frame(maxWidth: .infinity)
                                }.accessibilityAddTraits(option.id == selection ? [.isSelected] : [])
                            }
                        }
                    }
                }.frame(minWidth: 240, idealWidth: 360, minHeight: 280)
            }
    }
    private var matches: [EnoughOption<ID>] {
        options.filter { search.isEmpty || $0.title.localizedStandardContains(search) }
    }
}

/// One-based pagination. The caller owns total page count and data loading.
public struct EnoughPagination: View {
    @Binding private var page: Int
    private let totalPages: Int
    public init(page: Binding<Int>, totalPages: Int) { _page = page; self.totalPages = max(0, totalPages) }
    public var body: some View {
        HStack(spacing: 12) {
            EnoughIconButton("Previous page", systemImage: "chevron.left") { page = max(1, page - 1) }
                .disabled(page <= 1 || totalPages == 0)
            Text("Page \(totalPages == 0 ? 0 : page) of \(totalPages)")
            EnoughIconButton("Next page", systemImage: "chevron.right") { page = min(totalPages, page + 1) }
                .disabled(page >= totalPages || totalPages == 0)
        }.accessibilityElement(children: .contain)
    }
}

public struct EnoughBreadcrumb: Identifiable {
    public var id: String
    public var title: String
    public var destination: URL?
    public init(id: String, title: String, destination: URL? = nil) {
        self.id = id; self.title = title; self.destination = destination
    }
}
public struct EnoughBreadcrumbs: View {
    private let items: [EnoughBreadcrumb]
    @Environment(\.enoughTheme) private var theme
    public init(_ items: [EnoughBreadcrumb]) { self.items = items }
    public var body: some View {
        ScrollView(.horizontal) {
            HStack(spacing: 8) {
                ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                    if index > 0 { Image(systemName: "chevron.right").font(.caption).accessibilityHidden(true) }
                    if let destination = item.destination { Link(item.title, destination: destination) }
                    else { Text(item.title).foregroundStyle(theme.text) }
                }
            }.font(theme.font(.callout)).foregroundStyle(theme.muted)
        }.accessibilityElement(children: .contain).accessibilityLabel(Text("Breadcrumbs"))
    }
}

public struct EnoughCalendar: View {
    private let title: LocalizedStringKey
    private let range: ClosedRange<Date>
    @Binding private var selection: Date
    @Environment(\.enoughTheme) private var theme
    public init(_ title: LocalizedStringKey, selection: Binding<Date>,
                in range: ClosedRange<Date> = Date.distantPast...Date.distantFuture) {
        self.title = title; _selection = selection; self.range = range
    }
    public var body: some View {
        DatePicker(title, selection: $selection, in: range, displayedComponents: [.date])
            .datePickerStyle(.graphical).tint(theme.accent)
    }
}

public extension View {
    /// Native alerts preserve destructive roles and default/cancel keyboard behavior.
    func enoughAlert<Actions: View, Message: View>(
        _ title: LocalizedStringKey, isPresented: Binding<Bool>,
        @ViewBuilder actions: () -> Actions, @ViewBuilder message: () -> Message
    ) -> some View {
        alert(title, isPresented: isPresented, actions: actions, message: message)
    }
    func enoughConfirmationDialog<Actions: View>(
        _ title: LocalizedStringKey, isPresented: Binding<Bool>, @ViewBuilder actions: () -> Actions
    ) -> some View {
        confirmationDialog(title, isPresented: isPresented, titleVisibility: .visible, actions: actions)
    }
    func enoughTooltip(_ text: LocalizedStringKey) -> some View { help(Text(text)) }
}
