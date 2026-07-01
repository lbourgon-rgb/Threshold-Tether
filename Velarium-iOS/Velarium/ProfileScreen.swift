import SwiftUI

struct ProfileScreen: View {
    let profile: CompanionProfile

    @State private var activeStory: StoryCard?
    @State private var activeTile: GalleryItem?
    @State private var filter: GalleryKind = .all
    @State private var showingFriends = false

    private var visibleGallery: [GalleryItem] {
        VelariumFixtures.galleryItems.filter { item in
            switch filter {
            case .all:
                return true
            case .images:
                if case .image = item.kind { return true }
                return false
            case .quotes:
                if case .quote = item.kind { return true }
                return false
            }
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                ProfileHeader(profile: profile, onFriends: { showingFriends = true })
                StoryStrip(stories: VelariumFixtures.stories(for: profile), activeStory: $activeStory)
                GalleryFilterBar(filter: $filter)
                GalleryGrid(items: visibleGallery, activeTile: $activeTile)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
        }
        .background(Color.velBackground.ignoresSafeArea())
        .fullScreenCover(item: $activeStory) { story in
            StoryViewer(story: story)
        }
        .fullScreenCover(item: $activeTile) { tile in
            TileViewer(items: visibleGallery, initial: tile)
        }
        .sheet(isPresented: $showingFriends) {
            FriendMapSheet(profile: profile)
                .presentationDetents([.medium, .large])
        }
    }
}

struct ProfileHeader: View {
    let profile: CompanionProfile
    let onFriends: () -> Void

    var body: some View {
        VStack(spacing: 12) {
            HStack(alignment: .top, spacing: 12) {
                AvatarView(style: profile.avatar, size: 74)

                VStack(alignment: .leading, spacing: 7) {
                    HStack(alignment: .firstTextBaseline, spacing: 5) {
                        Text(profile.displayName)
                            .font(.system(.title2, design: .rounded, weight: .bold))
                            .foregroundStyle(Color.velText)
                            .lineLimit(1)

                        if !profile.pronouns.isEmpty {
                            Text(profile.pronouns)
                                .font(.caption)
                                .foregroundStyle(Color.velMuted)
                        }
                    }

                    Text(profile.handle)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Color.velRose)

                    HStack(spacing: 7) {
                        Chip(text: profile.modelLane, color: .velTeal)

                        if let url = profile.dashboardLink {
                            Link(destination: url) {
                                Label("Dashboard", systemImage: "arrow.up.right")
                                    .labelStyle(.titleAndIcon)
                            }
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Color.velText)
                            .padding(.horizontal, 9)
                            .padding(.vertical, 5)
                            .background(Color.white.opacity(0.07))
                            .clipShape(Capsule())
                        }
                    }

                    Text(profile.bio)
                        .font(.callout)
                        .foregroundStyle(Color.velText)
                        .lineLimit(3)
                        .fixedSize(horizontal: false, vertical: true)

                    ProvenanceRow(provenance: profile.provenance)
                }
            }

            HStack(spacing: 0) {
                StatView(value: profile.stats.memories, label: "memories")
                StatView(value: profile.stats.moments, label: "moments")
                Button(action: onFriends) {
                    StatView(value: profile.stats.friends, label: "friends")
                }
                .buttonStyle(.plain)
                StatView(value: profile.stats.images, label: "images")
            }
            .padding(.top, 8)
            .overlay(alignment: .top) {
                Rectangle()
                    .fill(Color.velStroke)
                    .frame(height: 1)
            }
        }
        .padding(12)
        .velCard()
    }
}

struct StoryStrip: View {
    let stories: [StoryCard]
    @Binding var activeStory: StoryCard?

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            ForEach(stories) { story in
                Button {
                    activeStory = story
                } label: {
                    VStack(spacing: 7) {
                        ZStack {
                            Circle()
                                .stroke(Color.velRose, lineWidth: 2)
                                .frame(width: 52, height: 52)
                            Image(systemName: story.systemImage)
                                .font(.system(size: 22, weight: .medium))
                                .foregroundStyle(Color.velRose)
                        }

                        Text(story.label)
                            .font(.caption2.weight(.semibold))
                            .foregroundStyle(Color.velText)
                            .multilineTextAlignment(.center)
                            .lineLimit(3)
                            .frame(maxWidth: .infinity, minHeight: 30, alignment: .top)
                    }
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(12)
        .velCard()
    }
}

struct GalleryFilterBar: View {
    @Binding var filter: GalleryKind

    var body: some View {
        HStack {
            Picker("Wall filter", selection: $filter) {
                ForEach(GalleryKind.allCases) { kind in
                    Text(kind.rawValue).tag(kind)
                }
            }
            .pickerStyle(.segmented)

            Button {
            } label: {
                Label("Latest", systemImage: "line.3.horizontal.decrease")
                    .font(.subheadline.weight(.semibold))
            }
            .buttonStyle(.bordered)
            .tint(.velRose)
        }
        .padding(10)
        .velCard()
    }
}

struct GalleryGrid: View {
    let items: [GalleryItem]
    @Binding var activeTile: GalleryItem?

    private let columns = [
        GridItem(.flexible(minimum: 92), spacing: 6),
        GridItem(.flexible(minimum: 92), spacing: 6),
        GridItem(.flexible(minimum: 92), spacing: 6)
    ]

    var body: some View {
        LazyVGrid(columns: columns, spacing: 6) {
            ForEach(items) { item in
                Button {
                    activeTile = item
                } label: {
                    GalleryTile(item: item)
                }
                .buttonStyle(.plain)
                .aspectRatio(1, contentMode: .fit)
            }
        }
    }
}

struct GalleryTile: View {
    let item: GalleryItem

    var body: some View {
        GeometryReader { proxy in
            ZStack(alignment: .bottomLeading) {
                tileContent
                    .frame(width: proxy.size.width, height: proxy.size.width)
                    .clipped()

                LinearGradient(
                    colors: [.clear, .black.opacity(0.74)],
                    startPoint: .center,
                    endPoint: .bottom
                )

                VStack(alignment: .leading, spacing: 5) {
                    Text(item.title)
                        .font(.caption.weight(.bold))
                        .foregroundStyle(.white)
                        .lineLimit(2)

                    ProvenancePill(provenance: item.provenance)
                }
                .padding(8)
            }
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .stroke(Color.velStroke, lineWidth: 1)
            )
        }
    }

    @ViewBuilder
    private var tileContent: some View {
        switch item.kind {
        case .image(let imageName, _):
            BundleGalleryImage(name: imageName, contentMode: .fill)
        case .quote(let quoteId):
            QuoteTileContent(quote: VelariumFixtures.quote(id: quoteId))
        }
    }
}

