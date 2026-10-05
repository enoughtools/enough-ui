import SwiftUI

public enum EnoughButtonVariant: String, CaseIterable, Sendable {
    case primary, secondary, accent, outline, ghost, destructive
}
public enum EnoughControlSize: String, CaseIterable, Sendable {
    case small, regular, large
    var verticalPadding: CGFloat { self == .small ? 6 : self == .large ? 13 : 10 }
    var horizontalPadding: CGFloat { self == .small ? 10 : self == .large ? 20 : 15 }
    var textStyle: Font.TextStyle { self == .small ? .caption : .callout }
}

/// Retains the system Button's focus, keyboard activation, role and disabled behavior.
public struct EnoughButtonStyle: ButtonStyle {
    public var variant: EnoughButtonVariant
    public var size: EnoughControlSize
    @Environment(\.enoughTheme) private var theme
    @Environment(\.isEnabled) private var isEnabled
    public init(_ variant: EnoughButtonVariant = .secondary, size: EnoughControlSize = .regular) {
        self.variant = variant; self.size = size
    }
    public func makeBody(configuration: Configuration) -> some View {
        configuration.label.font(theme.font(size.textStyle).weight(.semibold))
            .foregroundStyle(foreground)
            .padding(.horizontal, size.horizontalPadding).padding(.vertical, size.verticalPadding)
            .frame(minHeight: size == .small ? 28 : 44)
            .background(background.opacity(configuration.isPressed ? 0.8 : 1))
            .overlay(Rectangle().strokeBorder(border, lineWidth: variant == .ghost ? 0 : 1))
            .contentShape(Rectangle()).opacity(isEnabled ? 1 : 0.42)
    }
    private var foreground: Color {
        switch variant {
        case .primary, .accent: return theme.onAccent
        case .destructive: return theme.danger
        default: return theme.text
        }
    }
    private var background: Color {
        switch variant {
        case .primary, .accent: return theme.accent
        case .ghost, .outline: return .clear
        default: return theme.surface
        }
    }
    private var border: Color { variant == .primary || variant == .accent ? theme.accent : theme.hairline }
}

public struct EnoughButton<Label: View>: View {
    private let action: () -> Void
    private let label: Label
    private let role: ButtonRole?
    private let variant: EnoughButtonVariant
    private let size: EnoughControlSize
    public init(variant: EnoughButtonVariant = .secondary, size: EnoughControlSize = .regular,
                role: ButtonRole? = nil, action: @escaping () -> Void, @ViewBuilder label: () -> Label) {
        self.variant = variant; self.size = size; self.role = role; self.action = action; self.label = label()
    }
    public var body: some View {
        Button(role: role ?? (variant == .destructive ? .destructive : nil), action: action) { label }
            .buttonStyle(EnoughButtonStyle(variant, size: size))
    }
}
public extension EnoughButton where Label == Text {
    init(_ title: LocalizedStringKey, variant: EnoughButtonVariant = .secondary,
         size: EnoughControlSize = .regular, role: ButtonRole? = nil, action: @escaping () -> Void) {
        self.init(variant: variant, size: size, role: role, action: action) { Text(title) }
    }
}

public struct EnoughIconButton: View {
    private let title: LocalizedStringKey
    private let systemImage: String
    private let action: () -> Void
    private let variant: EnoughButtonVariant
    public init(_ title: LocalizedStringKey, systemImage: String,
                variant: EnoughButtonVariant = .ghost, action: @escaping () -> Void) {
        self.title = title; self.systemImage = systemImage; self.variant = variant; self.action = action
    }
    public var body: some View {
        EnoughButton(variant: variant, action: action) { Image(systemName: systemImage).frame(minWidth: 14) }
            .accessibilityLabel(Text(title)).help(Text(title))
    }
}

public struct EnoughButtonGroup<Content: View>: View {
    private let content: Content
    public init(@ViewBuilder content: () -> Content) { self.content = content() }
    public var body: some View { HStack(spacing: 0) { content }.accessibilityElement(children: .contain) }
}

/// A native menu; items can include Buttons, Pickers, Sections and nested Menus.
public struct EnoughMenu<Label: View, Content: View>: View {
    private let label: Label
    private let content: Content
    public init(@ViewBuilder content: () -> Content, @ViewBuilder label: () -> Label) {
        self.label = label(); self.content = content()
    }
    public var body: some View { Menu { content } label: { label }.buttonStyle(EnoughButtonStyle()) }
}

public struct EnoughToggle: View {
    private let title: LocalizedStringKey
    @Binding private var isOn: Bool
    @Environment(\.enoughTheme) private var theme
    public init(_ title: LocalizedStringKey, isOn: Binding<Bool>) { self.title = title; _isOn = isOn }
    public var body: some View {
        Button { isOn.toggle() } label: {
            HStack { Image(systemName: isOn ? "checkmark.square.fill" : "square"); Text(title) }
        }
        .buttonStyle(EnoughButtonStyle(isOn ? .primary : .outline))
        .accessibilityValue(Text(isOn ? "On" : "Off"))
        .accessibilityAddTraits(isOn ? [.isSelected] : [])
    }
}
