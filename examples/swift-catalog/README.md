# EnoughUI native gallery

From the repository root, run:

```sh
swift run --package-path examples/swift-catalog EnoughUICatalog
```

Choose an example in the sidebar to try native controls, bindings, menus and presentations. This independent Swift package uses EnoughUI directly from the local source checkout.

The compiled views in `Sources/EnoughUICatalog/Gallery` also supply the [web Swift gallery](https://enoughui.com/swift), including its complete source examples. `pnpm capture:swift-gallery` captures actual macOS and iPhone simulator control hierarchies in both appearances. Native controls keep their platform shapes and behavior. Charts compose Apple's Swift Charts with the EnoughUI theme.
