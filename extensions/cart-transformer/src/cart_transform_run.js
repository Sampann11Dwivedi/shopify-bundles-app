// @ts-check

/**
 * @typedef {import("../generated/api").CartTransformRunInput} CartTransformRunInput
 * @typedef {import("../generated/api").CartTransformRunResult} CartTransformRunResult
 */

/**
 * @type {CartTransformRunResult}
 */

const NO_CHANGES = {
  operations: [],
};

/**
 * @param {CartTransformRunInput} input
 * @returns {CartTransformRunResult}
 */

export function cartTransformRun(input) {
  /**
 * @typedef {{
 *   targetVariantId: string,
 *   addOnVariantId: string,
 *   addOnPrice: string,
 *   bundleTitle: string
 * }} Transform
 */

/** @type {Transform[]} */
  const transforms = input.cartTransform?.metafield?.jsonValue?.transforms || '[]';  

  const targetLineItem = input.cart.lines.find((line) => {
    return transforms.some((transform) => {
      if (line.merchandise.__typename === 'ProductVariant') {
        return  line.merchandise.id === transform.targetVariantId
      }
      return false; 
  })
  });
  

  if (!targetLineItem || targetLineItem.merchandise.__typename !== 'ProductVariant') {
  return NO_CHANGES;
}

  const targetTransform = transforms.find((transform) => {  
    if(targetLineItem.merchandise.__typename === 'ProductVariant' ) {
      return  targetLineItem.merchandise.id === transform.targetVariantId;
    }
    return false;
  });

    const baseAmount = targetLineItem.cost?.amountPerQuantity?.amount;

    if (!baseAmount) return NO_CHANGES;

  if ( targetLineItem && targetTransform && targetLineItem.merchandise.__typename === 'ProductVariant' ) {    

    return {
      operations: [{
        lineExpand : {
          cartLineId: targetLineItem.id,
          title: targetTransform.bundleTitle,
          expandedCartItems : [
            {
              merchandiseId: targetLineItem.merchandise.id,
              quantity: targetLineItem.quantity,
              price : {
                adjustment : {
                  fixedPricePerUnit :  {
                    amount : baseAmount.toString(),
                  },
                },
              },
            },
            {
              merchandiseId: targetTransform.addOnVariantId,
              quantity: targetLineItem.quantity,
              price : {
                adjustment : {
                  fixedPricePerUnit :  {
                    amount : String(targetTransform.addOnPrice),
                  },
                },
              }, 

            },
          ],
        },
      },
    ],
    };
  }
  return NO_CHANGES;
};