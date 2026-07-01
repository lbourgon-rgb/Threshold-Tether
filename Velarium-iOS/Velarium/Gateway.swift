import Foundation
import Combine

struct GatewayLiveMode: Decodable, Hashable {
    let requested: Bool?
    let allowed: Bool?
    let auth: String?
    let note: String?
}

struct GatewaySourceStatus: Identifiable, Decodable, Hashable {
    let id: String
    let label: String
    let kind: String?
    let configured: Bool?
    let status: String?
    let provenance: String?
    let note: String?
    let checkedAt: String?
    let secretEnv: String?
    let binding: String?
    let envName: String?
    let hasGatewaySecret: Bool?
}

struct GatewayHealth: Decodable {
    let ok: Bool
    let app: String?
    let mode: String?
    let schemaVersion: String?
    let generatedAt: String?
    let publicData: String?
    let livePrivateReads: GatewayLiveMode?
    let sourceStatus: [GatewaySourceStatus]?
}

struct VelariumGatewayClient {
    var baseURL: URL {
        if let value = Bundle.main.object(forInfoDictionaryKey: "VELARIUM_GATEWAY_BASE_URL") as? String,
           let url = URL(string: value.trimmingCharacters(in: .whitespacesAndNewlines)),
           !value.isEmpty {
            return url
        }

        return URL(string: "https://velarium.lbourgon.workers.dev")!
    }

    func fetchHealth() async throws -> GatewayHealth {
        var components = URLComponents(url: baseURL.appending(path: "/api/health"), resolvingAgainstBaseURL: false)!
        components.queryItems = [URLQueryItem(name: "check", value: "1")]

        var request = URLRequest(url: components.url!)
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.timeoutInterval = 12

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            throw URLError(.badServerResponse)
        }

        return try JSONDecoder().decode(GatewayHealth.self, from: data)
    }
}

@MainActor
final class GatewayStatusStore: ObservableObject {
    @Published private(set) var phase: ProvenanceKind = .mock
    @Published private(set) var updatedAt = "not checked"
    @Published private(set) var message = "Gateway has not been checked yet."
    @Published private(set) var sources: [GatewaySourceStatus] = []

    private let client = VelariumGatewayClient()

    func refresh() async {
        do {
            let health = try await client.fetchHealth()
            updatedAt = health.generatedAt ?? "just now"
            sources = health.sourceStatus ?? []

            if health.ok {
                phase = sources.contains(where: { $0.provenance == "live" }) ? .live : .cached
                message = health.livePrivateReads?.note ?? health.publicData ?? "Gateway responded."
            } else {
                phase = .mock
                message = "Gateway returned an unhealthy response."
            }
        } catch {
            phase = .mock
            updatedAt = "offline"
            message = "Gateway unavailable; using bundled fixtures."
            sources = []
        }
    }
}
