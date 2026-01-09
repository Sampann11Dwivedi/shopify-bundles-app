# Shopify Bundles App 🛍️

A Shopify app that lets merchants create product bundles that apply **at checkout**. Using **Shopify Functions** and **Cart Transform**, this app automatically adds add-on products when a target product is purchased.

## ✨ Features

- **Target & Add-on Logic:** Create bundles by selecting a *target product* and an *add-on product*.
- **Custom Pricing:** Set specific prices for add-on products within the bundle.
- **Checkout Display:** Define custom bundle titles shown specifically at checkout.
- **Checkout Native:** Works directly within the checkout flow, not just in the cart.
- **Metafield Configuration:** Easy configuration using Shopify Metafields.
- **Real-time Updates:** Add, update, or remove bundles instantly from the admin interface.

## 🛠️ Installation

1. **Clone this repository:**
   ```bash
   git clone <your-repo-url>
   cd shopify-bundles-app
   ```
2. **Install dependencies:**
    ```bash
    npm install
    ```
3. **Setup Configuration::**Rename the configuration file to enable the app settings:
     ```bash
    mv "shopify.app copy.toml" shopify.app.toml
    ```
4. **Start the development server:**
   ```bash
   npm run dev
   ```
## 🚀 Usage
1. Open the app from your Shopify Admin.
2. Click + Add bundle to create a new configuration.
3. Select a Target Product (the item that triggers the bundle).
4. Select an Add-on Product and set its custom price.
5. Save changes. Once saved, the bundles will automatically apply at checkout whenever the target product is purchased.

## ⚙️ API / Backend
1. Data Storage: Uses the Shopify GraphQL Admin API to fetch and save bundle configurations via Metafields.
2. Logic: The core functionality uses a Shopify Function (cartTransformRun) to implement the Cart Transform API.
3. Execution: The function executes at checkout to programmatically add the add-on product.

## 📝 Notes
1. No extra extensions or TypeGen required — the app works with just the standard code and the Shopify Function.
2. Checkout Only: This app modifies the checkout line items. Cart-level modifications are not required for this to function.
3. Metafield Storage: All bundle configurations are stored in a Metafield with the following details:
   Namespace: $app:cart-transforms
   Key: functions-configurations

## 📄 License
MIT License
   
