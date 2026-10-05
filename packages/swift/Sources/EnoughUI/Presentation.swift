import SwiftUI

public struct EnoughHeading: View {
    private let title: LocalizedStringKey
    private let style: Font.TextStyle
    @Environment(\.enoughTheme) private var theme
    public init(_ title: LocalizedStringKey, style: Font.TextStyle = .title) { self.title = title; self.style = style }
    public var body: some View {
        Text(title).font(theme.heading(style)).foregroundStyle(theme.text).accessibilityAddTraits(.isHeader)
    }
}
public struct EnoughEyebrow: View {
    private let title: LocalizedStringKey
    @Environment(\.enoughTheme) private var theme
    public init(_ title: LocalizedStringKey) { self.title = title }
    public var body: some View {
        Text(title).textCase(.uppercase).font(theme.font(.caption2).weight(.semibold))
            .tracking(1.6).foregroundStyle(theme.muted)
    }
}
public struct EnoughSeparator: View {
    private let axis: Axis
    @Environment(\.enoughTheme) private var theme
    public init(_ axis: Axis = .horizontal) { self.axis = axis }
    public var body: some View {
        Rectangle().fill(theme.hairline)
            .frame(width: axis == .vertical ? 1 : nil, height: axis == .horizontal ? 1 : nil)
            .accessibilityHidden(true)
    }
}
public struct EnoughCard<Content: View>: View {
    private let content: Content
    @Environment(\.enoughTheme) private var theme
    public init(@ViewBuilder content: () -> Content) { self.content = content() }
    public var body: some View {
        VStack(alignment: .leading, spacing: 16) { content }.padding(20)
            .frame(maxWidth: .infinity, alignment: .leading).background(theme.card)
            .overlay(Rectangle().strokeBorder(theme.hairline)).accessibilityElement(children: .contain)
    }
}
public struct EnoughCardHeader<Accessory: View>: View {
    private let title: LocalizedStringKey
    private let description: LocalizedStringKey?
    private let accessory: Accessory
    @Environment(\.enoughTheme) private var theme
    public init(_ title: LocalizedStringKey, description: LocalizedStringKey? = nil,
                @ViewBuilder accessory: () -> Accessory) {
        self.title = title; self.description = description; self.accessory = accessory()
    }
    public var body: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 6) {
                EnoughHeading(title, style: .title2)
                if let description { Text(description).font(theme.font(.callout)).foregroundStyle(theme.muted) }
            }
            Spacer(minLength: 8)
            accessory
        }
    }
}
public extension EnoughCardHeader where Accessory == EmptyView {
    init(_ title: LocalizedStringKey, description: LocalizedStringKey? = nil) {
        self.init(title, description: description) { EmptyView() }
    }
}
public struct EnoughBadge: View {
    private let title: LocalizedStringKey
    private let tone: EnoughTone
    @Environment(\.enoughTheme) private var theme
    public init(_ title: LocalizedStringKey, tone: EnoughTone = .neutral) { self.title = title; self.tone = tone }
    public var body: some View {
        Text(title).font(theme.font(.caption).weight(.semibold)).foregroundStyle(tone.color(in: theme))
            .padding(.horizontal, 8).padding(.vertical, 4)
            .background(tone.color(in: theme).opacity(0.08))
            .overlay(Rectangle().strokeBorder(tone.color(in: theme).opacity(0.35)))
    }
}
public struct EnoughAlert<Content: View>: View {
    private let title: LocalizedStringKey
    private let tone: EnoughTone
    private let content: Content
    @Environment(\.enoughTheme) private var theme
    public init(_ title: LocalizedStringKey, tone: EnoughTone = .accent, @ViewBuilder content: () -> Content) {
        self.title = title; self.tone = tone; self.content = content()
    }
    public var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: symbol).foregroundStyle(tone.color(in: theme)).accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 6) {
                Text(title).font(theme.font(.headline))
                content.font(theme.font(.callout)).foregroundStyle(theme.secondaryText)
            }
        }.padding(16).frame(maxWidth: .infinity, alignment: .leading)
            .background(theme.surface).overlay(alignment: .leading) { Rectangle().fill(tone.color(in: theme)).frame(width: 3) }
            .accessibilityElement(children: .combine)
    }
    private var symbol: String {
        switch tone {
        case .success: return "checkmark.circle"
        case .warning: return "exclamationmark.triangle"
        case .danger: return "exclamationmark.circle"
        default: return "info.circle"
        }
    }
}
public struct EnoughEmptyState<Actions: View>: View {
    private let title: LocalizedStringKey
    private let description: LocalizedStringKey
    private let systemImage: String
    private let actions: Actions
    @Environment(\.enoughTheme) private var theme
    public init(_ title: LocalizedStringKey, description: LocalizedStringKey, systemImage: String = "tray",
                @ViewBuilder actions: () -> Actions) {
        self.title = title; self.description = description; self.systemImage = systemImage; self.actions = actions()
    }
    public var body: some View {
        VStack(spacing: 12) {
            Image(systemName: systemImage).font(.system(.largeTitle)).foregroundStyle(theme.muted).accessibilityHidden(true)
            EnoughHeading(title, style: .title2)
            Text(description).foregroundStyle(theme.muted).multilineTextAlignment(.center)
            actions
        }.padding(28).frame(maxWidth: .infinity).accessibilityElement(children: .contain)
    }
}
public extension EnoughEmptyState where Actions == EmptyView {
    init(_ title: LocalizedStringKey, description: LocalizedStringKey, systemImage: String = "tray") {
        self.init(title, description: description, systemImage: systemImage) { EmptyView() }
    }
}
public struct EnoughAvatar: View {
    private let name: String
    private let url: URL?
    private let size: CGFloat
    @Environment(\.enoughTheme) private var theme
    @ScaledMetric private var scaledSize: CGFloat
    public init(_ name: String, url: URL? = nil, size: CGFloat = 40) {
        self.name = name; self.url = url; self.size = size; _scaledSize = ScaledMetric(wrappedValue: size)
    }
    public var body: some View {
        AsyncImage(url: url) { image in image.resizable().scaledToFill() } placeholder: {
            Text(initials).font(theme.font(.callout).weight(.semibold)).foregroundStyle(theme.accent)
                .frame(maxWidth: .infinity, maxHeight: .infinity).background(theme.accentSoft)
        }.frame(width: scaledSize, height: scaledSize).clipped().accessibilityLabel(Text(name))
    }
    private var initials: String { name.split(whereSeparator: { $0.isWhitespace }).prefix(2).compactMap(\.first).map(String.init).joined().uppercased() }
}
public struct EnoughSkeleton: View {
    private let width: CGFloat?
    private let height: CGFloat
    @Environment(\.enoughTheme) private var theme
    public init(width: CGFloat? = nil, height: CGFloat = 16) { self.width = width; self.height = height }
    public var body: some View { Rectangle().fill(theme.hairline).frame(width: width, height: height).accessibilityHidden(true) }
}
public struct EnoughProgress: View {
    private let title: LocalizedStringKey
    private let value: Double?
    private let total: Double
    @Environment(\.enoughTheme) private var theme
    public init(_ title: LocalizedStringKey, value: Double? = nil, total: Double = 1) {
        self.title = title; self.value = value; self.total = total
    }
    public var body: some View {
        ProgressView(title, value: value.map { min(max($0, 0), max(total, Double.leastNormalMagnitude)) }, total: max(total, Double.leastNormalMagnitude))
            .tint(theme.accent).font(theme.font(.callout))
    }
}
public struct EnoughSpinner: View {
    private let title: LocalizedStringKey
    public init(_ title: LocalizedStringKey = "Loading") { self.title = title }
    public var body: some View { ProgressView().accessibilityLabel(Text(title)) }
}
public struct EnoughKeyboardHint: View {
    private let keys: String
    @Environment(\.enoughTheme) private var theme
    public init(_ keys: String) { self.keys = keys }
    public var body: some View {
        Text(keys).font(theme.font(.caption)).foregroundStyle(theme.muted).padding(4)
            .background(theme.surface).overlay(Rectangle().strokeBorder(theme.hairline))
    }
}
public struct EnoughAspectRatio<Content: View>: View {
    private let ratio: CGFloat
    private let content: Content
    public init(_ ratio: CGFloat = 16 / 9, @ViewBuilder content: () -> Content) {
        self.ratio = ratio; self.content = content()
    }
    public var body: some View { content.aspectRatio(max(ratio, 0.01), contentMode: .fit) }
}
