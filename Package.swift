// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "EnoughUI",
    platforms: [.macOS(.v13), .iOS(.v16)],
    products: [.library(name: "EnoughUI", targets: ["EnoughUI"])],
    targets: [
        .target(name: "EnoughUI", path: "packages/swift/Sources/EnoughUI"),
        .testTarget(name: "EnoughUITests", dependencies: ["EnoughUI"], path: "packages/swift/Tests/EnoughUITests")
    ]
)
