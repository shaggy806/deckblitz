import { defineCard } from "../define.js";

// EDHREC rank 15175. Dig Deep's "for each creature card milled this way".

const TEXT =
  "When this creature enters, mill four cards. You gain 1 life for each creature card milled this way.";

export default defineCard({
  name: "Gorging Vulture",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT} (To mill four cards, put the top four cards of your library into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 4 },
          { kind: "gain-life", amount: { thisWay: "milled", filter: { type: "creature" } } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
