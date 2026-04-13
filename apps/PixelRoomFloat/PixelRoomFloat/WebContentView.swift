import SwiftUI
import WebKit

struct WebContentView: NSViewRepresentable {
    let url: URL

    /// 注入到页面的 JS：隐藏所有元素，只保留 .pixel-room-wrapper（像素房间动画）
    private static let isolateRoomJS = """
    (function() {
        function showOnlyRoom() {
            var room = document.querySelector('.pixel-room-wrapper');
            if (!room) return;

            document.body.style.background = 'transparent';
            document.body.style.overflow = 'hidden';
            document.body.style.margin = '0';
            document.documentElement.style.background = 'transparent';

            var sakura = document.querySelector('.sakura-container');
            if (sakura) sakura.style.display = 'none';

            var main = document.querySelector('main');
            if (main) {
                main.style.padding = '0';
                main.style.margin = '0';
                main.style.maxWidth = 'none';
                Array.from(main.children).forEach(function(el) {
                    if (el === room || el.contains(room) || el.querySelector('.pixel-room-wrapper')) return;
                    el.style.display = 'none';
                });
            }

            room.style.display = 'flex';
            room.style.justifyContent = 'center';
            room.style.alignItems = 'center';
            room.style.height = '100vh';
            room.style.padding = '8px';
            room.style.boxSizing = 'border-box';
        }

        new MutationObserver(showOnlyRoom)
            .observe(document.documentElement, { childList: true, subtree: true });
        showOnlyRoom();
    })();
    """

    func makeNSView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.preferences.setValue(true, forKey: "developerExtrasEnabled")

        // 页面加载完成后注入 JS
        let script = WKUserScript(
            source: Self.isolateRoomJS,
            injectionTime: .atDocumentEnd,
            forMainFrameOnly: true
        )
        config.userContentController.addUserScript(script)

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.setValue(false, forKey: "drawsBackground")
        webView.load(URLRequest(url: url))

        // 右键菜单
        let menu = NSMenu()
        menu.addItem(withTitle: "刷新", action: #selector(AppDelegate.reload), keyEquivalent: "r")
        menu.addItem(.separator())
        menu.addItem(withTitle: "退出", action: #selector(AppDelegate.quit), keyEquivalent: "q")
        webView.menu = menu

        return webView
    }

    func updateNSView(_ nsView: WKWebView, context: Context) {}
}
