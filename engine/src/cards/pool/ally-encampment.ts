import { defineCard } from "../define.js";

const BOUNCE_TEXT = "{1}, {T}, Sacrifice this land: Return target Ally you control to its owner's hand.";

export default defineCard({
  name: "Ally Encampment",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n{T}: Add one mana of any color. Spend this mana only to cast an Ally spell.\n${BOUNCE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      // Only a spell: not an Ally's abilities (the ruling).
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        spendOnly: { spell: { subtype: "Ally" }, text: "Spend this mana only to cast an Ally spell." },
      },
      resolve: null,
      text: "{T}: Add one mana of any color. Spend this mana only to cast an Ally spell.",
    },
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Ally" } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: BOUNCE_TEXT,
    },
  ],
});
