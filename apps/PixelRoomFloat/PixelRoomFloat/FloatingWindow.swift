import AppKit

final class FloatingWindow: NSWindow {
    init(contentRect: NSRect) {
        super.init(
            contentRect: contentRect,
            styleMask: [.borderless],
            backing: .buffered,
            defer: false
        )
        level = .floating
        isOpaque = false
        backgroundColor = .clear
        isMovableByWindowBackground = true
        hasShadow = true

        // 圆角裁剪
        contentView?.wantsLayer = true
        contentView?.layer?.cornerRadius = 12
        contentView?.layer?.masksToBounds = true
    }
}
