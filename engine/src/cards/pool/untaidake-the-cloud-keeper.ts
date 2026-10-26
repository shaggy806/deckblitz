import { defineCard } from "../define.js";

// EDHREC rank 10118.

const MANA_TEXT = "{T}, Pay 2 life: Add {C}{C}. Spend this mana only to cast legendary spells.";

export default defineCard({
  name: "Untaidake, the Cloud Keeper",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: `Untaidake enters tapped.\n${MANA_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "Untaidake enters tapped.",
    },
  ],
  activated: [
    {
      // Gnarlroot Trapper's life cost, Great Hall of the Citadel's restriction.
      cost: { mana: null, tap: true, payLife: 2 },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 2,
        spendOnly: { spell: { supertype: "legendary" }, text: "Spend this mana only to cast legendary spells." },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
