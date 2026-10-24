import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 15202.

const TEXT =
  "Rally — Whenever this creature or another Ally you control enters, each opponent loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Kalastria Healer",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric", "Ally"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: thisOrAnother({
    trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
    targets: [],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "lose-life", amount: 1, who: "each-opponent" },
        { kind: "gain-life", amount: 1 },
      ],
    },
    resolve: null,
    text: TEXT,
  }),
});
