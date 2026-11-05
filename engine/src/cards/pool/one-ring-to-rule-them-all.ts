import { defineCard } from "../define.js";

// The Ring tempts first, so the power read is the Ring-bearer chosen then, 0 with
// none. Each opponent's own graveyard in chapter III.
const ONE = "I — The Ring tempts you, then each player mills cards equal to your Ring-bearer's power.";
const TWO = "II — Destroy all nonlegendary creatures.";
const THREE = "III — Each opponent loses 1 life for each creature card in that player's graveyard.";

export default defineCard({
  name: "One Ring to Rule Them All",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${ONE}\n${TWO}\n${THREE}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "the-ring-tempts-you" },
          {
            kind: "mill",
            target: "each-player",
            amount: { aggregate: "sum", of: "power", filter: { ringBearer: true, controlledBy: "you" } },
          },
        ],
      },
      resolve: null,
      text: ONE,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "creature", notSupertype: "legendary" } },
      resolve: null,
      text: TWO,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "lose-life",
        who: "each-opponent",
        amount: { countInGraveyard: { type: "creature", ownedBy: "you" }, forEachPlayer: true },
      },
      resolve: null,
      text: THREE,
    },
  ],
});
