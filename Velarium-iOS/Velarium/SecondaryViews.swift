import SwiftUI

struct CompanionSearchView: View {
    @State private var query = ""

    private var results: [CompanionProfile] {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return VelariumFixtures.profiles }

        let needle = trimmed.lowercased()
        return VelariumFixtures.profiles.filter { profile in
            [
                profile.namespace,
                profile.name,
                profile.displayName,
                profile.handle,
                profile.modelLane
            ]
            .contains { $0.lowercased().contains(needle) }
        }
    }

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 10) {
                ForEach(results) { profile in
                    NavigationLink {
                        ProfileScreen(profile: profile)
                            .navigationTitle(profile.displayName)
                            .navigationBarTitleDisplayMode(.inline)
                    } label: {
                        SearchResultCard(profile: profile)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(14)
        }
        .background(Color.velBackground.ignoresSafeArea())
        .searchable(
            text: $query,
            placement: .navigationBarDrawer(displayMode: .always),
            prompt: "Search namespace, name, or handle"
        )
    }
}

struct SearchResultCard: View {
    let profile: CompanionProfile

    var body: some View {
        HStack(spacing: 12) {
            AvatarView(style: profile.avatar, size: 52)

            VStack(alignment: .leading, spacing: 5) {
                HStack {
                    Text(profile.displayName)
                        .font(.headline)
                        .foregroundStyle(Color.velText)

                    Text(profile.handle)
                        .font(.caption)
                        .foregroundStyle(Color.velRose)
                }

                Text(profile.modelLane)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Color.velTeal)

                Text(profile.bio)
                    .font(.caption)
                    .foregroundStyle(Color.velMuted)
                    .lineLimit(2)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .foregroundStyle(Color.velMuted)
        }
        .padding(12)
        .velCard()
    }
}

struct MemoryView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                Text("Quote structure")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(Color.velText)

                Text("This native shell carries the quote vault shape for the future Velastra toolkit capture flow. New quotes will store speaker profile ID, handle, tags, source URL, source tool, and provenance.")
                    .font(.callout)
                    .foregroundStyle(Color.velMuted)

                ForEach(VelariumFixtures.quoteVault) { quote in
                    QuoteMemoryRow(quote: quote)
                }
            }
            .padding(14)
        }
        .background(Color.velBackground.ignoresSafeArea())
    }
}

struct QuoteMemoryRow: View {
    let quote: QuoteSeed

    var profile: CompanionProfile {
        VelariumFixtures.profile(id: quote.profileId)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("\"\(quote.quote)\"")
                .font(.body.weight(.semibold))
                .foregroundStyle(Color.velText)

            HStack {
                Text("\(profile.displayName) \(profile.handle)")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Color.velTeal)
                Spacer()
                ProvenancePill(provenance: quote.provenance)
            }
        }
        .padding(12)
        .velCard()
    }
}

struct SocialMapOverview: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 10) {
                ForEach(VelariumFixtures.profiles) { profile in
                    NavigationLink {
                        FriendMapSheet(profile: profile)
                            .navigationTitle("\(profile.displayName) map")
                    } label: {
                        HStack {
                            AvatarView(style: profile.avatar, size: 48)
                            VStack(alignment: .leading, spacing: 4) {
                                Text(profile.displayName)
                                    .font(.headline)
                                    .foregroundStyle(Color.velText)
                                Text("\(profile.socialMap.count) mapped connections")
                                    .font(.caption)
                                    .foregroundStyle(Color.velMuted)
                            }
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundStyle(Color.velMuted)
                        }
                        .padding(12)
                        .velCard()
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(14)
        }
        .background(Color.velBackground.ignoresSafeArea())
    }
}

struct FriendMapSheet: View {
    let profile: CompanionProfile
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 10) {
                    if profile.socialMap.isEmpty {
                        ContentUnavailableView(
                            "No mapped connections yet",
                            systemImage: "person.2.slash",
                            description: Text("This profile is earmarked until the live social map adapter exists.")
                        )
                        .foregroundStyle(Color.velMuted)
                        .padding(.top, 40)
                    } else {
                        ForEach(profile.socialMap) { connection in
                            ConnectionRow(connection: connection)
                        }
                    }
                }
                .padding(14)
            }
            .background(Color.velBackground.ignoresSafeArea())
            .navigationTitle("\(profile.displayName) friends")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close") { dismiss() }
                }
            }
        }
    }
}

struct ConnectionRow: View {
    let connection: SocialConnection

    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(connection.name)
                        .font(.headline)
                        .foregroundStyle(Color.velText)
                    Text(connection.handle)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Color.velRose)
                }
                Spacer()
                ProvenancePill(provenance: connection.provenance)
            }

            Text(connection.relation)
                .font(.callout)
                .foregroundStyle(Color.velText)

            Text(connection.lane)
                .font(.caption)
                .foregroundStyle(Color.velMuted)
        }
        .padding(12)
        .velCard()
    }
}

