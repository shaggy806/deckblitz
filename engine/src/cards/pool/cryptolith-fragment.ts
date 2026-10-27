import { defineCard } from "../define.js";

// EDHREC rank 4929. The life loss is part of the mana ability (its ruling: no
// one can respond). "If each player has 10 or less life" is an intervening-if,
// so it's read as the upkeep begins and again as the trigger resolves.

export default defineCard({
  name: "Cryptolith Fragment",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters tapped.\n{T}: Add one mana of any color. Each player loses 1 life.\nAt the beginning of your upkeep, if each player has 10 or less life, transform this artifact.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        also: { kind: "lose-life", amount: 1, who: "each-player" },
      },
      resolve: null,
      text: "{T}: Add one mana of any color. Each player loses 1 life.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "life-total", who: "you", atMost: 10 },
          { kind: "life-total", who: "each-opponent", atMost: 10 },
        ],
      },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of your upkeep, if each player has 10 or less life, transform this artifact.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
  faces: ["Cryptolith Fragment", "Aurora of Emrakul"],
  transform: true,
});
