import SwiftUI

struct StoryViewer: View {
    let story: StoryCard

    @Environment(\.dismiss) private var dismiss
    @State private var progress = 0.0

    var body: some View {
        ZStack(alignment: .top) {
            Color.black.ignoresSafeArea()

            VStack(alignment: .leading, spacing: 18) {
                ProgressView(value: progress)
                    .tint(.velRose)
                    .padding(.top, 10)

                HStack {
                    ProvenanceRow(provenance: story.provenance)
                    Spacer()
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.headline)
                            .foregroundStyle(Color.velText)
                            .frame(width: 38, height: 38)
                            .background(Color.white.opacity(0.10))
                            .clipShape(Circle())
                    }
                }

                Spacer(minLength: 8)

                if let imageName = story.imageName {
                    BundleGalleryImage(name: imageName, contentMode: .fit)
                        .frame(maxHeight: 280)
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }

                Text(story.title)
                    .font(.system(.largeTitle, design: .rounded, weight: .bold))
                    .foregroundStyle(Color.velText)

                VStack(alignment: .leading, spacing: 10) {
                    ForEach(story.body, id: \.self) { line in
                        HStack(alignment: .top, spacing: 8) {
                            Circle()
                                .fill(Color.velRose)
                                .frame(width: 6, height: 6)
                                .padding(.top, 7)
                            Text(line)
                                .font(.body)
                                .foregroundStyle(Color.velMuted)
                        }
                    }
                }

                Spacer()
            }
            .padding(20)
        }
        .onAppear {
            withAnimation(.linear(duration: story.duration)) {
                progress = 1.0
            }
        }
        .task {
            try? await Task.sleep(nanoseconds: UInt64(story.duration * 1_000_000_000))
            if !Task.isCancelled {
                dismiss()
            }
        }
    }
}

struct TileViewer: View {
    let items: [GalleryItem]
    @State private var selectedID: String

    @Environment(\.dismiss) private var dismiss

    init(items: [GalleryItem], initial: GalleryItem) {
        self.items = items
        _selectedID = State(initialValue: initial.id)
    }

    var body: some View {
        ZStack(alignment: .topTrailing) {
            Color.black.ignoresSafeArea()

            TabView(selection: $selectedID) {
                ForEach(items) { item in
                    FullscreenTile(item: item)
                        .tag(item.id)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .automatic))

            Button {
                dismiss()
            } label: {
                Image(systemName: "xmark")
                    .font(.headline)
                    .foregroundStyle(Color.velText)
                    .frame(width: 42, height: 42)
                    .background(.ultraThinMaterial)
                    .clipShape(Circle())
            }
            .padding(.top, 20)
            .padding(.trailing, 18)
        }
    }
}

struct FullscreenTile: View {
    let item: GalleryItem

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                content
                    .frame(maxWidth: .infinity)
                    .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))

                Text(item.title)
                    .font(.title2.weight(.bold))
                    .foregroundStyle(Color.velText)

                ProvenanceRow(provenance: item.provenance)
            }
            .padding(.horizontal, 18)
            .padding(.top, 86)
            .padding(.bottom, 36)
        }
    }

    @ViewBuilder
    private var content: some View {
        switch item.kind {
        case .image(let imageName, _):
            BundleGalleryImage(name: imageName, contentMode: .fit)
                .frame(maxHeight: 680)
        case .quote(let quoteId):
            QuotePoster(quote: VelariumFixtures.quote(id: quoteId))
                .frame(minHeight: 420)
        }
    }
}

struct QuoteCaptureSheet: View {
    @Environment(\.dismiss) private var dismiss
    @State private var speakerId = "axiom"
    @State private var quoteText = ""

    private var speaker: CompanionProfile {
        VelariumFixtures.profile(id: speakerId)
    }

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 14) {
                Text("Future quote capture")
                    .font(.title2.weight(.bold))
                    .foregroundStyle(Color.velText)

                Picker("Speaker", selection: $speakerId) {
                    ForEach(VelariumFixtures.profiles.filter { $0.id != "vel" }) { profile in
                        Text("\(profile.displayName) \(profile.handle)").tag(profile.id)
                    }
                }
                .pickerStyle(.menu)
                .tint(.velRose)

                TextEditor(text: $quoteText)
                    .frame(minHeight: 140)
                    .padding(8)
                    .scrollContentBackground(.hidden)
                    .background(Color.velSurfaceRaised)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .stroke(Color.velStroke, lineWidth: 1)
                    )

                Text("Will append \(speaker.handle), store profile ID, tags, source URL, source tool, and provenance. This sheet is local mock UI until the Velastra toolkit endpoint exists.")
                    .font(.callout)
                    .foregroundStyle(Color.velMuted)

                Spacer()
            }
            .padding(18)
            .background(Color.velBackground.ignoresSafeArea())
            .navigationTitle("Add Quote")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Close") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Save") { dismiss() }
                        .disabled(quoteText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
        }
    }
}

