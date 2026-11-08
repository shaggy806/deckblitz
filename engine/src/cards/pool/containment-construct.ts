import { defineCard } from "../define.js";

// Only if it's still that card in the graveyard it went to (rule 400.7): a madness
// card discarded into exile isn't exiled again here. "Play": a land too (rule 305.1).
const TEXT =
  "Whenever you discard a card, you may exile that card from your graveyard. If you do, you may play that card this turn.";

export default defineCard({
  name: "Containment Construct",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile that card, and you may play it this turn?",
        effect: { kind: "exile", target: "trigger-object", mayPlay: { duration: "end-of-turn", play: true } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
