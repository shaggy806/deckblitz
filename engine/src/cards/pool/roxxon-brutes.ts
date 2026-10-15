import { defineCard } from "../define.js";

// EDHREC rank 20394.
const DRAW_TEXT = "Whenever you draw your second card each turn, put a +1/+1 counter on target creature.";

export default defineCard({
  name: "Roxxon Brutes",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Berserker", "Villain"],
  power: 4,
  toughness: 4,
  keywords: ["menace"],
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${DRAW_TEXT}\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)`,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
