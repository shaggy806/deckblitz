import { defineCard } from "../define.js";

// Back face of Brass's Tunnel-Grinder. "Mana produced by Tecutlan" is this very
// permanent's (`manaFrom.fromSource`); X is the spell's mana value, with {X} at
// its chosen value and ignoring what was actually paid (the rulings).

const CAST_TEXT =
  "Whenever you cast a permanent spell using mana produced by Tecutlan, discover X, where X is that spell's mana value.";

export default defineCard({
  name: "Tecutlan, the Searing Rift",
  art: "https://cards.scryfall.io/art_crop/back/d/6/d61d8895-7f2e-4c77-951f-4f1a49e96f57.jpg",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  subtypes: ["Cave"],
  text: `(Transforms from Brass's Tunnel-Grinder.)\n{T}: Add {R}.\n${CAST_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "{T}: Add {R}.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
          manaFrom: { fromSource: true },
        },
      },
      targets: [],
      effect: { kind: "discover", amount: { manaValueOf: "trigger-object" } },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  faces: ["Brass's Tunnel-Grinder", "Tecutlan, the Searing Rift"],
  transform: true,
});
