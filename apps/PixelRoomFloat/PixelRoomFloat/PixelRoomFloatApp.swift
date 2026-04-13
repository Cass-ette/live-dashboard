import SwiftUI
import WebKit

@main
struct PixelRoomFloatApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        Settings { EmptyView() }
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    private var window: FloatingWindow?

    func applicationDidFinishLaunching(_ notification: Notification) {
        let screenFrame = NSScreen.main?.visibleFrame ?? NSRect(x: 0, y: 0, width: 800, height: 600)
        let windowSize = NSSize(width: 480, height: 280)
        let origin = NSPoint(
            x: screenFrame.maxX - windowSize.width - 20,
            y: screenFrame.maxY - windowSize.height - 20
        )

        let window = FloatingWindow(contentRect: NSRect(origin: origin, size: windowSize))

        let url = URL(string: "http://8.147.59.78")!
        let hostView = NSHostingView(rootView: WebContentView(url: url))
        window.contentView?.addSubview(hostView)
        hostView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            hostView.topAnchor.constraint(equalTo: window.contentView!.topAnchor),
            hostView.bottomAnchor.constraint(equalTo: window.contentView!.bottomAnchor),
            hostView.leadingAnchor.constraint(equalTo: window.contentView!.leadingAnchor),
            hostView.trailingAnchor.constraint(equalTo: window.contentView!.trailingAnchor),
        ])

        window.makeKeyAndOrderFront(nil)
        self.window = window
    }

    @objc func reload() {
        guard let contentView = window?.contentView else { return }
        for subview in contentView.subviews {
            if let hostView = subview as? NSHostingView<WebContentView> {
                // Find WKWebView in hierarchy
                findWebView(in: hostView)?.reload()
                break
            }
        }
    }

    @objc func quit() {
        NSApplication.shared.terminate(nil)
    }

    private func findWebView(in view: NSView) -> WKWebView? {
        if let webView = view as? WKWebView { return webView }
        for subview in view.subviews {
            if let found = findWebView(in: subview) { return found }
        }
        return nil
    }
}
