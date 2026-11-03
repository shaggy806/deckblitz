import { defineCard } from "../define.js";

const SURVEIL_TEXT =
  "{1}, Sacrifice another creature: Surveil 1. (Look at the top card of your library. You may put that card into your graveyard.)";
const END_STEP_TEXT =
  "At the beginning of your end step, if there are five or more mana values among cards in your graveyard, you may pay 2 life. If you do, draw a card.";

export default defineCard({
  name: "Sanguine Spy",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 2,
  toughness: 3,
  keywords: ["menace", "lifelink"],
  text: `Menace, lifelink\n${SURVEIL_TEXT}\n${END_STEP_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      otherOnly: true,
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: SURVEIL_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: {
        kind: "aggregate",
        value: { aggregate: "distinct", of: "mana-value", filter: { ownedBy: "you" }, in: "graveyards" },
        compare: { op: "gte", n: 5 },
      },
      targets: [],
      effect: { kind: "may", prompt: "Pay 2 life to draw a card?", costLife: 2, effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: END_STEP_TEXT,
    },
  ],
});
