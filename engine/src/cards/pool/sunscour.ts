import { defineCard } from "../define.js";

// EDHREC rank 21024. Coldsnap. Fury of the Horde's alternative cost.

export default defineCard({
  name: "Sunscour",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  alternativeCost: {
    mana: "{0}",
    exileFromHand: { filter: { colors: ["W"] }, count: 2, text: "two white cards" },
  },
  text: "You may exile two white cards from your hand rather than pay this spell's mana cost.\nDestroy all creatures.",
  effect: { kind: "destroy-all", filter: { type: "creature" } },
});
