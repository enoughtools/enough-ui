import SwiftUI

/// A labelled control with optional guidance and validation. Validation remains app-owned.
public struct EnoughField<Content: View>: View {
    private let title: LocalizedStringKey
    private let description: LocalizedStringKey?
    private let error: LocalizedStringKey?
    private let content: Content
    @Environment(\.enoughTheme) private var theme
    public init(_ title: LocalizedStringKey, description: LocalizedStringKey? = nil,
                error: LocalizedStringKey? = nil, @ViewBuilder content: () -> Content) {
        self.title = title; self.description = description; self.error = error; self.content = content()
    }
    public var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title).font(theme.font(.callout).weight(.semibold))
            content.accessibilityLabel(Text(title)).accessibilityHint(Text(error ?? description ?? ""))
            if let error { Text(error).font(theme.font(.caption)).foregroundStyle(theme.danger) }
            else if let description { Text(description).font(theme.font(.caption)).foregroundStyle(theme.muted) }
        }.accessibilityElement(children: .contain)
    }
}

public struct EnoughTextFieldStyle: TextFieldStyle {
    @Environment(\.enoughTheme) private var theme
    @Environment(\.isEnabled) private var isEnabled
    public init() {}
    public func _body(configuration: TextField<Self._Label>) -> some View {
        configuration.textFieldStyle(.plain).font(theme.font(.body)).padding(10)
            .frame(minHeight: 44).background(theme.surface)
            .overlay(Rectangle().strokeBorder(theme.hairline)).opacity(isEnabled ? 1 : 0.42)
    }
}
public struct EnoughTextField: View {
    private let title: LocalizedStringKey
    private let prompt: LocalizedStringKey?
    @Binding private var text: String
    public init(_ title: LocalizedStringKey, text: Binding<String>, prompt: LocalizedStringKey? = nil) {
        self.title = title; _text = text; self.prompt = prompt
    }
    public var body: some View {
        TextField(title, text: $text, prompt: prompt.map { Text($0) })
            .textFieldStyle(EnoughTextFieldStyle()).accessibilityLabel(Text(title))
    }
}
public struct EnoughSecureField: View {
    private let title: LocalizedStringKey
    @Binding private var text: String
    public init(_ title: LocalizedStringKey, text: Binding<String>) { self.title = title; _text = text }
    public var body: some View {
        SecureField(title, text: $text).textFieldStyle(EnoughTextFieldStyle()).accessibilityLabel(Text(title))
    }
}
public struct EnoughTextEditor: View {
    private let title: LocalizedStringKey
    private let minimumHeight: CGFloat
    @Binding private var text: String
    @Environment(\.enoughTheme) private var theme
    public init(_ title: LocalizedStringKey, text: Binding<String>, minimumHeight: CGFloat = 100) {
        self.title = title; _text = text; self.minimumHeight = minimumHeight
    }
    public var body: some View {
        TextEditor(text: $text).font(theme.font()).scrollContentBackground(.hidden)
            .padding(8).frame(minHeight: minimumHeight).background(theme.surface)
            .overlay(Rectangle().strokeBorder(theme.hairline)).accessibilityLabel(Text(title))
    }
}
public struct EnoughSearchField: View {
    private let title: LocalizedStringKey
    @Binding private var text: String
    @Environment(\.enoughTheme) private var theme
    public init(_ title: LocalizedStringKey = "Search", text: Binding<String>) { self.title = title; _text = text }
    public var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass").foregroundStyle(theme.muted).accessibilityHidden(true)
            TextField(title, text: $text).textFieldStyle(.plain).accessibilityLabel(Text(title))
            if !text.isEmpty {
                EnoughIconButton("Clear search", systemImage: "xmark") { text = "" }
            }
        }.font(theme.font()).padding(.leading, 10).padding(.trailing, text.isEmpty ? 10 : 0)
            .frame(minHeight: 44).background(theme.surface).overlay(Rectangle().strokeBorder(theme.hairline))
    }
}
public struct EnoughSwitch: View {
    private let title: LocalizedStringKey
    @Binding private var isOn: Bool
    @Environment(\.enoughTheme) private var theme
    public init(_ title: LocalizedStringKey, isOn: Binding<Bool>) { self.title = title; _isOn = isOn }
    public var body: some View { Toggle(title, isOn: $isOn).toggleStyle(.switch).tint(theme.accent).font(theme.font()) }
}
public struct EnoughCheckbox: View {
    private let title: LocalizedStringKey
    @Binding private var isOn: Bool
    @Environment(\.enoughTheme) private var theme
    public init(_ title: LocalizedStringKey, isOn: Binding<Bool>) { self.title = title; _isOn = isOn }
    public var body: some View {
        #if os(macOS)
        Toggle(title, isOn: $isOn).toggleStyle(.checkbox).font(theme.font()).tint(theme.accent)
        #else
        Toggle(title, isOn: $isOn).toggleStyle(EnoughCheckboxStyle()).font(theme.font())
        #endif
    }
}
#if !os(macOS)
private struct EnoughCheckboxStyle: ToggleStyle {
    @Environment(\.enoughTheme) private var theme
    func makeBody(configuration: Configuration) -> some View {
        Button { configuration.isOn.toggle() } label: {
            HStack {
                Image(systemName: configuration.isOn ? "checkmark.square.fill" : "square")
                    .foregroundStyle(configuration.isOn ? theme.accent : theme.muted)
                configuration.label.foregroundStyle(theme.text)
            }.frame(minHeight: 44)
        }.buttonStyle(.plain).accessibilityValue(Text(configuration.isOn ? "Checked" : "Unchecked"))
            .accessibilityAddTraits(configuration.isOn ? [.isSelected] : [])
    }
}
#endif

/// Uses native Picker options, including `.tag(value)` on every option.
public struct EnoughSelect<Selection: Hashable, Content: View>: View {
    private let title: LocalizedStringKey
    private let content: Content
    @Binding private var selection: Selection
    @Environment(\.enoughTheme) private var theme
    public init(_ title: LocalizedStringKey, selection: Binding<Selection>, @ViewBuilder content: () -> Content) {
        self.title = title; _selection = selection; self.content = content()
    }
    public var body: some View {
        Picker(title, selection: $selection) { content }.pickerStyle(.menu)
            .font(theme.font()).tint(theme.accent)
    }
}
public struct EnoughSegmentedControl<Selection: Hashable, Content: View>: View {
    private let title: LocalizedStringKey
    private let content: Content
    @Binding private var selection: Selection
    public init(_ title: LocalizedStringKey, selection: Binding<Selection>, @ViewBuilder content: () -> Content) {
        self.title = title; _selection = selection; self.content = content()
    }
    public var body: some View { Picker(title, selection: $selection) { content }.pickerStyle(.segmented) }
}
public struct EnoughRadioGroup<Selection: Hashable, Content: View>: View {
    private let title: LocalizedStringKey
    private let content: Content
    @Binding private var selection: Selection
    public init(_ title: LocalizedStringKey, selection: Binding<Selection>, @ViewBuilder content: () -> Content) {
        self.title = title; _selection = selection; self.content = content()
    }
    public var body: some View {
        #if os(macOS)
        Picker(title, selection: $selection) { content }.pickerStyle(.radioGroup)
        #else
        Picker(title, selection: $selection) { content }.pickerStyle(.inline)
        #endif
    }
}
public struct EnoughSlider: View {
    private let title: LocalizedStringKey
    private let range: ClosedRange<Double>
    private let step: Double?
    private let onEditingChanged: (Bool) -> Void
    @Binding private var value: Double
    @Environment(\.enoughTheme) private var theme
    public init(_ title: LocalizedStringKey, value: Binding<Double>, in range: ClosedRange<Double> = 0...1,
                step: Double? = nil, onEditingChanged: @escaping (Bool) -> Void = { _ in }) {
        self.title = title; _value = value; self.range = range; self.step = step; self.onEditingChanged = onEditingChanged
    }
    public var body: some View {
        Group {
            if let step {
                Slider(value: $value, in: range, step: step, onEditingChanged: onEditingChanged) { Text(title) }
            } else {
                Slider(value: $value, in: range, onEditingChanged: onEditingChanged) { Text(title) }
            }
        }.tint(theme.accent)
    }
}
public struct EnoughDatePicker: View {
    private let title: LocalizedStringKey
    private let range: ClosedRange<Date>
    private let components: DatePickerComponents
    @Binding private var selection: Date
    @Environment(\.enoughTheme) private var theme
    public init(_ title: LocalizedStringKey, selection: Binding<Date>,
                in range: ClosedRange<Date> = Date.distantPast...Date.distantFuture,
                displayedComponents: DatePickerComponents = [.date]) {
        self.title = title; _selection = selection; self.range = range; self.components = displayedComponents
    }
    public var body: some View {
        DatePicker(title, selection: $selection, in: range, displayedComponents: components).tint(theme.accent)
    }
}
