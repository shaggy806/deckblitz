import { defineCard } from "../define.js";

// EDHREC rank 29662.

const RETURN =
  "At the beginning of your upkeep, if you have more cards in hand than each opponent, you may return this card from your graveyard to your hand.";

export default defineCard({
  name: "Exile into Darkness",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `Target player sacrifices a creature of their choice with mana value 3 or less.\n${RETURN}`,
  targets: ["player"],
  effect: {
    kind: "sacrifice",
    who: "target",
    filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
    count: 1,
  },
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "player-compare", stat: "hand", compare: "more", than: "each-opponent" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Exile into Darkness from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN,
    },
  ],
});
