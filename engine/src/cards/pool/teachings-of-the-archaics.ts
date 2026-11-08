import { defineCard } from "../define.js";

export default defineCard({
  name: "Teachings of the Archaics",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "If an opponent has more cards in hand than you, draw two cards. Draw three cards instead if an opponent has at least four more cards in hand than you.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: {
      kind: "amounts",
      left: { amongPlayers: "greatest", of: { cardsInHand: "each" }, who: "each-opponent" },
      op: "gte",
      right: { sum: [{ cardsInHand: "you" }, 4] },
    },
    then: { kind: "draw", amount: 3 },
    else: {
      kind: "conditional",
      condition: { kind: "player-compare", stat: "hand", compare: "fewer", than: "an-opponent" },
      then: { kind: "draw", amount: 2 },
    },
  },
});
