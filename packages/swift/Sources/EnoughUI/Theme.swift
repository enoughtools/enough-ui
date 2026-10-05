import SwiftUI

/// Appearance-specific semantic tokens. Supply a custom theme to `EnoughThemeProvider`.
public struct EnoughTheme: Sendable {
    public var colorScheme: ColorScheme
    public var paper: Color
    public var surface: Color
    public var card: Color
    public var text: Color
    public var secondaryText: Color
    public var muted: Color
    public var hairline: Color
    public var accent: Color
    public var accentSoft: Color
    public var onAccent: Color
    public var success: Color
    public var warning: Color
    public var danger: Color
    public var headingFontName: String?
    public var bodyFontName: String?

    public init(
        colorScheme: ColorScheme = .light,
        paper: Color, surface: Color, card: Color, text: Color, secondaryText: Color,
        muted: Color, hairline: Color, accent: Color, accentSoft: Color,
        onAccent: Color = .white, success: Color, warning: Color, danger: Color,
        headingFontName: String? = nil, bodyFontName: String? = nil
    ) {
        self.colorScheme = colorScheme
        self.paper = paper; self.surface = surface; self.card = card; self.text = text
        self.secondaryText = secondaryText; self.muted = muted; self.hairline = hairline
        self.accent = accent; self.accentSoft = accentSoft; self.onAccent = onAccent
        self.success = success; self.warning = warning; self.danger = danger
        self.headingFontName = headingFontName; self.bodyFontName = bodyFontName
    }

    public static let light = EnoughTheme(
        paper: .enoughRGB(EnoughPalette.paper), surface: .enoughRGB(EnoughPalette.surface),
        card: .enoughRGB(EnoughPalette.card), text: .enoughRGB(EnoughPalette.text),
        secondaryText: .enoughRGB(EnoughPalette.secondaryText), muted: .enoughRGB(EnoughPalette.muted),
        hairline: .enoughRGB(EnoughPalette.hairline), accent: .enoughRGB(EnoughPalette.accent),
        accentSoft: .enoughRGB(EnoughPalette.accentSoft), success: .enoughRGB(EnoughPalette.success),
        warning: .enoughRGB(EnoughPalette.warning), danger: .enoughRGB(0xA02F2D)
    )
    public static let dark = EnoughTheme(
        colorScheme: .dark,
        paper: .enoughRGB(EnoughPalette.ink), surface: .enoughRGB(EnoughPalette.inkSecondary),
        card: .enoughRGB(EnoughPalette.inkSecondary), text: .enoughRGB(EnoughPalette.darkText),
        secondaryText: .enoughRGB(EnoughPalette.darkSecondaryText), muted: .enoughRGB(EnoughPalette.darkMuted),
        hairline: .enoughRGB(0x3D4553), accent: .enoughRGB(EnoughPalette.darkAccent),
        accentSoft: .enoughRGB(0x2A3040), onAccent: .enoughRGB(EnoughPalette.ink),
        success: .enoughRGB(EnoughPalette.darkSuccess), warning: .enoughRGB(0xE5BF62),
        danger: .enoughRGB(0xF19B99)
    )

    public func font(_ style: Font.TextStyle = .body) -> Font {
        bodyFontName.map { .custom($0, size: Self.size(for: style), relativeTo: style) } ?? .system(style)
    }
    public func heading(_ style: Font.TextStyle = .title) -> Font {
        headingFontName.map { .custom($0, size: Self.size(for: style), relativeTo: style) }
            ?? .system(style, design: .serif)
    }
    private static func size(for style: Font.TextStyle) -> CGFloat {
        switch style {
        case .largeTitle: return 34
        case .title: return 28
        case .title2: return 22
        case .title3: return 20
        case .headline, .body: return 17
        case .callout: return 16
        case .subheadline: return 15
        case .footnote: return 13
        case .caption: return 12
        case .caption2: return 11
        @unknown default: return 17
        }
    }
}

public extension Color {
    static func enoughRGB(_ rgb: UInt32) -> Color {
        Color(.sRGB, red: Double((rgb >> 16) & 255) / 255,
              green: Double((rgb >> 8) & 255) / 255, blue: Double(rgb & 255) / 255, opacity: 1)
    }
}

private struct EnoughThemeKey: EnvironmentKey {
    static let defaultValue: EnoughTheme? = nil
}
public extension EnvironmentValues {
    /// Automatically follows the system appearance unless explicitly overridden.
    var enoughTheme: EnoughTheme {
        get { self[EnoughThemeKey.self] ?? (colorScheme == .dark ? .dark : .light) }
        set { self[EnoughThemeKey.self] = newValue }
    }
}

public struct EnoughThemeProvider<Content: View>: View {
    private let theme: EnoughTheme?
    private let content: Content
    @Environment(\.colorScheme) private var colorScheme
    public init(theme: EnoughTheme? = nil, @ViewBuilder content: () -> Content) {
        self.theme = theme; self.content = content()
    }
    public var body: some View {
        let resolved = theme ?? (colorScheme == .dark ? .dark : .light)
        content.environment(\.enoughTheme, resolved).environment(\.colorScheme, resolved.colorScheme)
            .font(resolved.font()).foregroundStyle(resolved.text).tint(resolved.accent)
            .background(resolved.paper)
    }
}

public enum EnoughTone: String, CaseIterable, Sendable {
    case neutral, accent, success, warning, danger
    public func color(in theme: EnoughTheme) -> Color {
        switch self {
        case .neutral: return theme.muted
        case .accent: return theme.accent
        case .success: return theme.success
        case .warning: return theme.warning
        case .danger: return theme.danger
        }
    }
}
