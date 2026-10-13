import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 7641.

const TEXT = "Whenever this creature or another artifact you control enters, each opponent loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Pactdoll Terror",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Toy"],
  power: 3,
  toughness: 4,
  text: TEXT,
  // "This creature or another": its own entry counts whatever its types.
  triggered: thisOrAnother({
    trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" } },
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
