import {
  Page,
  Card,
  Box,
  TextField,
  Button,
  Banner,
  Text,
  Divider,
} from "@shopify/polaris";

import { useEffect, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

export default function Bundles() {
  const shopify = useAppBridge();

  const selectProduct = async (setVariantId) => {
    const product = await shopify.resourcePicker({
      type: "product",
      multiple: false,
    });

    if (product && product[0]?.variants?.length) {
      setVariantId(product[0].variants[0].id);
    }
  };

  const [transforms, setTransforms] = useState([]);
  const [cartTransformId, setCartTransformId] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/cart-transform")
      .then((r) => r.json())
      .then((d) => {
        setTransforms(d.transforms || []);
        setCartTransformId(d.cartTransformId);
      });
  }, []);

  console.log("transforms", transforms);

  const save = async () => {
    console.log("cartTransformId", cartTransformId);

    setSuccess(false);
    const r = await fetch("/api/cart-transform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartTransformId, transforms }),
    });
    console.log(r);

    if (r.ok) setSuccess(true);
  };

  const deleteBundle = async (index) => {
    const r = await fetch("/api/cart-transform", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartTransformId, index }),
    });
    if (r.ok) {
      const newTransforms = transforms.filter((_, i) => i !== index);
      setTransforms(newTransforms);
    }
  };

  return (
    <Page
      title="Product Bundles"
      subtitle="Create cart-based product bundles and upsells"
      primaryAction={{ content: "Save changes", onAction: save }}
    >
      {success && <Banner tone="success">Saved successfully</Banner>}

      {/* Add bundle header */}
      <Card>
        <Box padding="400" align="space-between">
          <Box>
            <Text as="h2" variant="headingLg">
              Bundles
            </Text>
            <Text tone="subdued">
              Manage which products trigger add-on offers
            </Text>
          </Box>

          <Button
            primary
            onClick={() =>
              setTransforms([
                ...transforms,
                {
                  targetVariantId: "",
                  addOnVariantId: "",
                  addOnPrice: "",
                  bundleTitle: "",
                },
              ])
            }
          >
            + Add bundle
          </Button>
        </Box>
      </Card>

      {/* Bundle list */}
      {transforms.map((t, i) => (
        <Card key={i}>
          <Box padding="500">
            {/* Bundle header */}
            <Box align="space-between" paddingBlockEnd="300">
              <Box>
                <Text as="h1" variant="headingMd">
                  {t.bundleTitle || `Bundle #${i + 1}`}
                </Text>
                <Text tone="subdued" variant="bodySm">
                  Shown when target product is added to cart
                </Text>
              </Box>

              <Button
                align="right"
                destructive
                plain
                onClick={() =>
                  // setTransforms(transforms.filter((_, idx) => idx !== i))
                  deleteBundle(i)
                }
              >
                Remove
              </Button>
            </Box>

            <Divider />

            {/* Products section */}
            <Box paddingBlock="400">
              <Box paddingBlockStart="300">
                <TextField
                  label="Target product"
                  placeholder="Main product that activates this bundle"
                  value={t.targetVariantId}
                  onChange={(v) => {
                    const copy = [...transforms];
                    copy[i].targetVariantId = v;
                    setTransforms(copy);
                  }}
                />

                <Box paddingBlockStart="200">
                  <Button
                    plain
                    onClick={() =>
                      selectProduct((id) => {
                        const copy = [...transforms];
                        copy[i].targetVariantId = id;
                        setTransforms(copy);
                      })
                    }
                  >
                    Select product
                  </Button>
                </Box>
              </Box>

              <Box paddingBlockStart="400">
                <TextField
                  label="Add-on product"
                  placeholder="Product offered at a special price"
                  value={t.addOnVariantId}
                  onChange={(v) => {
                    const copy = [...transforms];
                    copy[i].addOnVariantId = v;
                    setTransforms(copy);
                  }}
                />

                <Box paddingBlockStart="200">
                  <Button
                    plain
                    onClick={() =>
                      selectProduct((id) => {
                        const copy = [...transforms];
                        copy[i].addOnVariantId = id;
                        setTransforms(copy);
                      })
                    }
                  >
                    Select add-on product
                  </Button>
                </Box>
              </Box>
            </Box>

            <Divider />

            {/* Offer details */}
            <Box paddingBlock="400">
              <Box paddingBlockStart="300">
                <TextField
                  type="number"
                  label="Add-on price"
                  placeholder="Discounted price shown in cart"
                  value={t.addOnPrice}
                  onChange={(v) => {
                    const copy = [...transforms];
                    copy[i].addOnPrice = v;
                    setTransforms(copy);
                  }}
                />
              </Box>

              <Box paddingBlockStart="300">
                <TextField
                  label="Bundle title"
                  placeholder="Bundle title shown in cart"
                  value={t.bundleTitle}
                  onChange={(v) => {
                    const copy = [...transforms];
                    copy[i].bundleTitle = v;
                    setTransforms(copy);
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Card>
      ))}
    </Page>
  );
}
