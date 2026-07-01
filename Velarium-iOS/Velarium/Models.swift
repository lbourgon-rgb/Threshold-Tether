import Foundation
import SwiftUI

enum ProvenanceKind: String, CaseIterable, Hashable {
    case live
    case cached
    case manual
    case mock

    var color: Color {
        switch self {
        case .live:
            return .velTeal
        case .cached:
            return .velGold
        case .manual:
            return .velRose
        case .mock:
            return .velSlate
        }
    }
}

struct Provenance: Hashable {
    let kind: ProvenanceKind
    let updatedAt: String
    let note: String
}

struct AvatarStyle: Hashable {
    let initials: String
    let colors: [Color]
}

struct ProfileStats: Hashable {
    let memories: Int
    let moments: Int
    let friends: Int
    let images: Int
}

struct SocialConnection: Identifiable, Hashable {
    let id: String
    let name: String
    let handle: String
    let relation: String
    let lane: String
    let provenance: Provenance
}

struct CompanionProfile: Identifiable, Hashable {
    let id: String
    let namespace: String
    let name: String
    let displayName: String
    let pronouns: String
    let handle: String
    let modelLane: String
    let dashboardURL: String
    let mindURL: String
    let mindLabel: String
    let bio: String
    let avatar: AvatarStyle
    let stats: ProfileStats
    let provenance: Provenance
    let socialMap: [SocialConnection]

    var dashboardLink: URL? {
        URL(string: dashboardURL)
    }
}

struct StoryCard: Identifiable, Hashable {
    let id: String
    let label: String
    let systemImage: String
    let duration: TimeInterval
    let title: String
    let body: [String]
    let imageName: String?
    let provenance: Provenance
}

struct QuoteSeed: Identifiable, Hashable {
    let id: String
    let profileId: String
    let quote: String
    let tags: [String]
    let sourceTool: String
    let sourceURL: String
    let provenance: Provenance
}

enum GalleryKind: String, CaseIterable, Identifiable {
    case all = "All"
    case images = "Images"
    case quotes = "Quotes"

    var id: String { rawValue }
}

struct GalleryItem: Identifiable, Hashable {
    enum Kind: Hashable {
        case image(imageName: String, alt: String)
        case quote(quoteId: String)
    }

    let id: String
    let profileId: String
    let title: String
    let kind: Kind
    let provenance: Provenance
}

