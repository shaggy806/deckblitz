import { defineCard } from "../define.js";

// A colorless snow artifact token *named* Replicated Ring (Replicating Ring):
// keyed " Token" and named by `tokenName`, as Icy Manalith Token is.

export default defineCard({
  name: "Replicated Ring Token",
  tokenName: "Replicated Ring",
  art: "092bc98e-cca1-4d8e-bcde-074621280fed",
  colors: [],
  supertypes: ["snow"],
  types: ["artifact"],
  text: "{T}: Add one mana of any color.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
});
