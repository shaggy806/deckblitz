import { defineCard } from "../define.js";

const PREPARE =
  "At the beginning of each end step, if an opponent has more cards in hand than you, this creature becomes prepared.";

export default defineCard({
  name: "Joined Researchers",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${PREPARE} (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "player-compare", stat: "hand", compare: "fewer", than: "an-opponent" },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: PREPARE,
    },
  ],
  prepareSpell: "Secret Rendezvous",
});
