import SwiftUI
import UIKit

struct AvatarView: View {
    let style: AvatarStyle
    let size: CGFloat

    var body: some View {
        ZStack {
            Circle()
                .fill(LinearGradient.avatar(style))
            Text(style.initials)
                .font(.system(size: size * 0.42, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
        }
        .frame(width: size, height: size)
        .overlay(Circle().stroke(Color.white.opacity(0.30), lineWidth: 1))
    }
}

struct Chip: View {
    let text: String
    let color: Color

    var body: some View {
        Text(text)
            .font(.caption.weight(.semibold))
            .foregroundStyle(color)
            .lineLimit(1)
            .padding(.horizontal, 9)
            .padding(.vertical, 5)
            .background(color.opacity(0.12))
            .clipShape(Capsule())
            .overlay(Capsule().stroke(color.opacity(0.55), lineWidth: 1))
    }
}

struct StatView: View {
    let value: Int
    let label: String

    var body: some View {
        VStack(spacing: 3) {
            Text(value.formatted())
                .font(.headline.weight(.bold))
                .foregroundStyle(Color.velRose)
            Text(label)
                .font(.caption2)
                .foregroundStyle(Color.velMuted)
        }
        .frame(maxWidth: .infinity)
        .contentShape(Rectangle())
    }
}

struct ProvenanceRow: View {
    let provenance: Provenance

    var body: some View {
        HStack(spacing: 7) {
            Circle()
                .fill(provenance.kind.color)
                .frame(width: 7, height: 7)
            Text(provenance.kind.rawValue)
                .font(.caption.weight(.bold))
                .foregroundStyle(provenance.kind.color)
            Text(provenance.updatedAt)
                .font(.caption)
                .foregroundStyle(Color.velMuted)
                .lineLimit(1)
        }
    }
}

struct ProvenancePill: View {
    let provenance: Provenance

    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(provenance.kind.color)
                .frame(width: 6, height: 6)
            Text(provenance.kind.rawValue)
                .font(.caption2.weight(.bold))
                .foregroundStyle(Color.velText)
        }
        .padding(.horizontal, 7)
        .padding(.vertical, 4)
        .background(Color.black.opacity(0.45))
        .clipShape(Capsule())
    }
}

struct BundleGalleryImage: View {
    let name: String
    let contentMode: ContentMode

    private var uiImage: UIImage? {
        if let image = UIImage(named: name) {
            return image
        }

        if let url = Bundle.main.url(forResource: name, withExtension: "png", subdirectory: "Gallery") {
            return UIImage(contentsOfFile: url.path)
        }

        return nil
    }

    var body: some View {
        if let uiImage {
            Image(uiImage: uiImage)
                .resizable()
                .aspectRatio(contentMode: contentMode)
        } else {
            ZStack {
                Color.velSurfaceRaised
                Image(systemName: "photo")
                    .font(.largeTitle)
                    .foregroundStyle(Color.velMuted)
            }
        }
    }
}

struct QuoteTileContent: View {
    let quote: QuoteSeed?

    var body: some View {
        QuotePoster(quote: quote)
            .padding(10)
            .background(
                LinearGradient(
                    colors: [Color.velSurfaceRaised, Color.velBackground],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
    }
}

struct QuotePoster: View {
    let quote: QuoteSeed?

    var profile: CompanionProfile? {
        guard let quote else { return nil }
        return VelariumFixtures.profile(id: quote.profileId)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("\"")
                .font(.system(size: 44, weight: .heavy, design: .rounded))
                .foregroundStyle(Color.velRose)
                .frame(height: 24)

            Text(quote?.quote ?? "Quote unavailable")
                .font(.system(.title3, design: .rounded, weight: .semibold))
                .foregroundStyle(Color.velText)
                .fixedSize(horizontal: false, vertical: true)

            Spacer(minLength: 8)

            if let profile {
                Text("\(profile.displayName) \(profile.handle)")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Color.velTeal)
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            LinearGradient(
                colors: [Color.velSurfaceRaised, Color.velBackground],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }
}
