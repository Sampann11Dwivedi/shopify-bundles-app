import express from "express";
import shopify from "../shopify.js";

const router = express.Router();

/* ---------- GET CONFIG ---------- */
router.get("/", async (req, res) => {

console.log("indie this ");    
  const session = res.locals.shopify.session;
  if (!session) return res.status(401).send("Unauthorized");

  const client = new shopify.api.clients.Graphql({ session });

  const result = await client.query({
    data: `
      query {
        cartTransforms(first: 1) {
          edges {
            node {
              id
              metafield(key: "functions-configurations" namespace: "$app:cart-transforms") {
                jsonValue
              }
            }
          }
        }
      }
    `,
  });

  const node = result.body.data.cartTransforms.edges?.[0]?.node;

  res.json({
    cartTransformId: node?.id ?? "",
    transforms: node?.metafield?.jsonValue?.transforms ?? [],
  });
});

/* ---------- SAVE CONFIG ---------- */
router.post("/", async (req, res) => {
  const session = res.locals.shopify.session;
  if (!session) return res.status(401).send("Unauthorized");

  const { cartTransformId, transforms } = req.body;

  const client = new shopify.api.clients.Graphql({ session });

  const metafieldInput = {
    ownerId: cartTransformId,
    namespace: "$app:cart-transforms",
    key: "functions-configurations",
    type: "json",
    value: JSON.stringify({ transforms }),
  };

  if (cartTransformId) {
      try {

    const response = await client.query({
    data: {
      "query": `mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            key
            namespace
            value
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
            code
          }
        }
      }`,
      "variables": {
          "metafields": [
            metafieldInput
          ]
      },
    },
  });

    const userErrors = response.body.data.metafieldsSet.userErrors;

    if (userErrors.length) {
      console.error(userErrors);
      return res.status(400).json({ errors: userErrors });
    }

    return res.json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
  }



const variables = {
    metafields: [
      {
        namespace: "$app:cart-transforms",
        key: "functions-configurations",
        type: "json",
        value: JSON.stringify({ transforms })
      },
    ],
  };

  
  try {
  const response = await client.query({
    data: `
         mutation cartTransformCreate(
          $metafields: [MetafieldInput!]
          ) {
          cartTransformCreate(
            functionId: "019b9e8d-a2f7-7b86-abb7-957e8a5ecd2a"
            blockOnFailure: false
            metafields: $metafields
          ) {
            cartTransform {
              id
            }
            userErrors {
              field
              message
            }
          }
        }`,
    "variables": {
      ...variables

    }
  });

  const result = response.body.data.cartTransformCreate;
  const userErrors = result.userErrors;

    if (userErrors.length) {
      console.error(userErrors);
      return res.status(400).json({ errors: userErrors });
    }

  res.json({ success: true });


  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }

});

router.delete("/", async (req, res) => {

  console.log("inside delete");
  
  const session = res.locals.shopify.session;
  if (!session) return res.status(401).send("Unauthorized");
  
  const { cartTransformId, index } = req.body;
  
  const client = new shopify.api.clients.Graphql({ session });

  // delete the transform at the specified index
  const getResult = await client.query({
    data: `
      query {
        cartTransforms(first: 20) {
        nodes {
          id
          metafield(key: "functions-configurations" namespace: "$app:cart-transforms") {
            jsonValue
          }
          }
        }
      }
    `,
  });

  const nodea = getResult.body.data.cartTransforms.nodes.find(n => n.id === cartTransformId);
  const metafield = nodea?.metafield;
  
  const transforms = metafield?.jsonValue?.transforms || [];

  console.log(transforms);

  transforms.splice(index, 1); // remove the transform at the specified index

  const metafieldInput = {
    ownerId: cartTransformId,
    namespace: "$app:cart-transforms",
    key: "functions-configurations",
    type: "json",
    value: JSON.stringify({ transforms }),
  };

  const response = await client.query({
    data: {
      "query": `mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            key
            namespace
            value
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
            code
          }
        }
      }`,
      "variables": {
          "metafields": [
            metafieldInput
          ]
      },
    },
  });

  const userErrors = response.body.data.metafieldsSet.userErrors;

  if (userErrors.length) {
    console.error(userErrors);
    return res.status(400).json({ errors: userErrors });
  }

  return res.json({ success: true }); 

});



export default router;
