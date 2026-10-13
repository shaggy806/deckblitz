import { defineCard } from "../define.js";

// EDHREC rank 10689.

const ENTER_TEXT =
  "When this enchantment enters, each opponent loses 2 life and you gain 2 life. Surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)";
const BOUNCE_TEXT = "When a Dragon you control enters, return this enchantment to its owner's hand.";

export default defineCard({
  name: "Corroding Dragonstorm",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${BOUNCE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, who: "each-opponent" },
          { kind: "gain-life", amount: 2 },
          { kind: "surveil", amount: 2 },
        ],
      },
      resolve: null,
      text: "When this enchantment enters, each opponent loses 2 life and you gain 2 life. Surveil 2.",
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Dragon" } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: BOUNCE_TEXT,
    },
  ],
});
