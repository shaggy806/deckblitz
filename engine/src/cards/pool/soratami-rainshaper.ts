import { defineCard } from "../define.js";

// EDHREC rank 16474.

const SHROUD_TEXT =
  "{3}, Return a land you control to its owner's hand: Target creature you control gains shroud until end of turn. (It can't be the target of spells or abilities.)";

export default defineCard({
  name: "Soratami Rainshaper",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Wizard"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${SHROUD_TEXT}`,
  activated: [
    {
      // Soramaro's land-return cost, Sylvan Safekeeper's effect.
      cost: { mana: "{3}", tap: false, returnToHand: { count: 1, filter: { type: "land" } } },
      targets: ["creature-you-control"],
      effect: { kind: "grant-keyword", target: 0, keyword: "shroud", duration: "end-of-turn" },
      resolve: null,
      text: SHROUD_TEXT,
    },
  ],
});
