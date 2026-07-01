import SwiftUI

extension Color {
    static let velBackground = Color(red: 0.030, green: 0.050, blue: 0.070)
    static let velSurface = Color(red: 0.060, green: 0.090, blue: 0.120)
    static let velSurfaceRaised = Color(red: 0.085, green: 0.125, blue: 0.165)
    static let velStroke = Color.white.opacity(0.12)
    static let velText = Color(red: 0.940, green: 0.970, blue: 0.960)
    static let velMuted = Color(red: 0.620, green: 0.710, blue: 0.760)
    static let velRose = Color(red: 0.940, green: 0.360, blue: 0.610)
    static let velTeal = Color(red: 0.240, green: 0.800, blue: 0.720)
    static let velGold = Color(red: 0.960, green: 0.700, blue: 0.280)
    static let velSlate = Color(red: 0.420, green: 0.500, blue: 0.560)
}

extension LinearGradient {
    static func avatar(_ style: AvatarStyle) -> LinearGradient {
        LinearGradient(
            colors: style.colors,
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}

struct CardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(Color.velSurface)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(Color.velStroke, lineWidth: 1)
            )
    }
}

extension View {
    func velCard() -> some View {
        modifier(CardModifier())
    }
}

