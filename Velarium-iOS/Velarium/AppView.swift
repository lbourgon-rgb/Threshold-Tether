import SwiftUI

enum AppTab: Hashable, CaseIterable {
    case home
    case search
    case capture
    case memory
    case map

    var title: String {
        switch self {
        case .home:
            return "Home"
        case .search:
            return "Search"
        case .capture:
            return "Add"
        case .memory:
            return "Memory"
        case .map:
            return "Map"
        }
    }

    var systemImage: String {
        switch self {
        case .home:
            return "house.fill"
        case .search:
            return "magnifyingglass"
        case .capture:
            return "plus.circle.fill"
        case .memory:
            return "rectangle.stack"
        case .map:
            return "person.2"
        }
    }
}

struct AppView: View {
    @State private var selectedTab: AppTab = .home
    @State private var showingQuoteCapture = false

    var body: some View {
        TabView(selection: Binding(get: { selectedTab }, set: updateSelection)) {
            NavigationStack {
                ProfileScreen(profile: VelariumFixtures.profile(id: "vel"))
                    .navigationTitle("Velarium")
                    .navigationBarTitleDisplayMode(.inline)
            }
            .tag(AppTab.home)
            .tabItem { Label(AppTab.home.title, systemImage: AppTab.home.systemImage) }

            NavigationStack {
                CompanionSearchView()
                    .navigationTitle("Search")
            }
            .tag(AppTab.search)
            .tabItem { Label(AppTab.search.title, systemImage: AppTab.search.systemImage) }

            Color.velBackground
                .tag(AppTab.capture)
                .tabItem { Label(AppTab.capture.title, systemImage: AppTab.capture.systemImage) }

            NavigationStack {
                MemoryView()
                    .navigationTitle("Memory")
            }
            .tag(AppTab.memory)
            .tabItem { Label(AppTab.memory.title, systemImage: AppTab.memory.systemImage) }

            NavigationStack {
                SocialMapOverview()
                    .navigationTitle("Map")
            }
            .tag(AppTab.map)
            .tabItem { Label(AppTab.map.title, systemImage: AppTab.map.systemImage) }
        }
        .tint(.velRose)
        .sheet(isPresented: $showingQuoteCapture) {
            QuoteCaptureSheet()
                .presentationDetents([.medium, .large])
        }
    }

    private func updateSelection(_ tab: AppTab) {
        if tab == .capture {
            showingQuoteCapture = true
            return
        }

        selectedTab = tab
    }
}

