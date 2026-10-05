import SwiftUI

public struct EnoughAccordion<Label: View, Content: View>: View {
    private let label: Label
    private let content: Content
    @Binding private var isExpanded: Bool
    @Environment(\.enoughTheme) private var theme
    public init(isExpanded: Binding<Bool>, @ViewBuilder content: () -> Content, @ViewBuilder label: () -> Label) {
        _isExpanded = isExpanded; self.content = content(); self.label = label()
    }
    public var body: some View {
        DisclosureGroup(isExpanded: $isExpanded) { content.padding(.vertical, 10) } label: { label }
            .tint(theme.accent).padding(14).background(theme.surface)
            .overlay(Rectangle().strokeBorder(theme.hairline))
    }
}
public struct EnoughItem<Leading: View, Trailing: View>: View {
    private let title: LocalizedStringKey
    private let description: LocalizedStringKey?
    private let leading: Leading
    private let trailing: Trailing
    @Environment(\.enoughTheme) private var theme
    public init(_ title: LocalizedStringKey, description: LocalizedStringKey? = nil,
                @ViewBuilder leading: () -> Leading, @ViewBuilder trailing: () -> Trailing) {
        self.title = title; self.description = description; self.leading = leading(); self.trailing = trailing()
    }
    public var body: some View {
        HStack(alignment: .center, spacing: 12) {
            leading
            VStack(alignment: .leading, spacing: 4) {
                Text(title).font(theme.font(.headline))
                if let description { Text(description).font(theme.font(.callout)).foregroundStyle(theme.muted) }
            }
            Spacer(minLength: 8)
            trailing
        }.padding(.vertical, 12).accessibilityElement(children: .contain)
    }
}
public extension EnoughItem where Leading == EmptyView, Trailing == EmptyView {
    init(_ title: LocalizedStringKey, description: LocalizedStringKey? = nil) {
        self.init(title, description: description) { EmptyView() } trailing: { EmptyView() }
    }
}

/// Keeps native navigation destinations and state in the consuming app.
public struct EnoughNavigation<Sidebar: View, Detail: View>: View {
    private let sidebar: Sidebar
    private let detail: Detail
    public init(@ViewBuilder sidebar: () -> Sidebar, @ViewBuilder detail: () -> Detail) {
        self.sidebar = sidebar(); self.detail = detail()
    }
    public var body: some View { NavigationSplitView { sidebar } detail: { detail } }
}
public struct EnoughTabs<Selection: Hashable, Content: View>: View {
    @Binding private var selection: Selection
    private let content: Content
    @Environment(\.enoughTheme) private var theme
    public init(selection: Binding<Selection>, @ViewBuilder content: () -> Content) {
        _selection = selection; self.content = content()
    }
    public var body: some View { TabView(selection: $selection) { content }.tint(theme.accent) }
}
public struct EnoughScrollArea<Content: View>: View {
    private let axes: Axis.Set
    private let content: Content
    public init(_ axes: Axis.Set = .vertical, @ViewBuilder content: () -> Content) {
        self.axes = axes; self.content = content()
    }
    public var body: some View { ScrollView(axes) { content } }
}

/// A dismissible, persistent status surface. Lifetime and announcements are app-owned.
public struct EnoughToast<Content: View>: View {
    @Binding private var isPresented: Bool
    private let title: LocalizedStringKey
    private let tone: EnoughTone
    private let content: Content
    public init(_ title: LocalizedStringKey, isPresented: Binding<Bool>, tone: EnoughTone = .success,
                @ViewBuilder content: () -> Content) {
        self.title = title; _isPresented = isPresented; self.tone = tone; self.content = content()
    }
    public var body: some View {
        if isPresented {
            HStack(alignment: .top, spacing: 0) {
                EnoughAlert(title, tone: tone) { content }
                EnoughIconButton("Dismiss notification", systemImage: "xmark") { isPresented = false }
            }.accessibilityElement(children: .contain)
        }
    }
}

public extension View {
    /// Native modal presentation supplies platform dismissal and focus behavior.
    func enoughSheet<Content: View>(isPresented: Binding<Bool>, @ViewBuilder content: @escaping () -> Content) -> some View {
        modifier(EnoughSheetModifier(isPresented: isPresented, content: content))
    }
    func enoughPopover<Content: View>(isPresented: Binding<Bool>, @ViewBuilder content: @escaping () -> Content) -> some View {
        modifier(EnoughPopoverModifier(isPresented: isPresented, presentedContent: content))
    }
}
private struct EnoughSheetModifier<Presented: View>: ViewModifier {
    @Binding var isPresented: Bool
    let content: () -> Presented
    @Environment(\.enoughTheme) private var theme
    func body(content base: Content) -> some View {
        base.sheet(isPresented: $isPresented) { EnoughThemeProvider(theme: theme) { content().padding(24) } }
    }
}
private struct EnoughPopoverModifier<Presented: View>: ViewModifier {
    @Binding var isPresented: Bool
    let presentedContent: () -> Presented
    @Environment(\.enoughTheme) private var theme
    func body(content: Content) -> some View {
        content.popover(isPresented: $isPresented) { EnoughThemeProvider(theme: theme) { presentedContent().padding(16) } }
    }
}
