import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 21387.

const TEXT =
  "{2}, Return a land you control to its owner's hand: Target creature with power 2 or less can't be blocked this turn.";

export default defineCard({
  name: "Soratami Mirror-Guard",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Wizard"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false, returnToHand: { count: 1, filter: { type: "land" } } },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
