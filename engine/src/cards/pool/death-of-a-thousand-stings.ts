import { defineCard } from "../define.js";

const RETURN =
  "At the beginning of your upkeep, if you have more cards in hand than each opponent, you may return this card from your graveyard to your hand.";

export default defineCard({
  name: "Death of a Thousand Stings",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: `Target player loses 1 life and you gain 1 life.\n${RETURN}`,
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", amount: 1, target: 0 },
      { kind: "gain-life", amount: 1 },
    ],
  },
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "player-compare", stat: "hand", compare: "more", than: "each-opponent" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Death of a Thousand Stings from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN,
    },
  ],
});
