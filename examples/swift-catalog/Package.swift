// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "EnoughUICatalog",
    platforms: [.macOS(.v13), .iOS(.v16)],
    dependencies: [.package(name: "EnoughUI", path: "../..")],
    targets: [.executableTarget(name: "EnoughUICatalog", dependencies: [.product(name: "EnoughUI", package: "EnoughUI")])]
)
