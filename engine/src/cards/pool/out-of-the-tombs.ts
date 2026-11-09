import { defineCard } from "../define.js";

export default defineCard({
  name: "Out of the Tombs",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "At the beginning of your upkeep, put two eon counters on this enchantment, then mill cards equal to the number of eon counters on it.\nIf you would draw a card while your library has no cards in it, instead return a creature card from your graveyard to the battlefield. If you can't, you lose the game.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "eon", amount: 2 },
          { kind: "mill", target: "you", amount: { countersOn: "source", counter: "eon" } },
        ],
      },
      resolve: null,
      text: "At the beginning of your upkeep, put two eon counters on this enchantment, then mill cards equal to the number of eon counters on it.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "you",
        whileLibraryEmpty: true,
        instead: {
          effect: {
            kind: "conditional",
            condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { type: "creature" } },
            then: { kind: "return-from-graveyard", filter: { type: "creature" }, destination: "battlefield", count: 1 },
            else: { kind: "lose-game" },
          },
        },
      },
      text: "If you would draw a card while your library has no cards in it, instead return a creature card from your graveyard to the battlefield. If you can't, you lose the game.",
    },
  ],
});
