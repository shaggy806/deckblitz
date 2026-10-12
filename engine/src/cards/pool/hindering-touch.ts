import { defineCard } from "../define.js";

export default defineCard({
  name: "Hindering Touch",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {2}.\nStorm (When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the copies.)",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ pay: "{2}", text: "Pay {2}" }],
    otherwise: { kind: "counter", target: 0 },
  },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "storm" },
      resolve: null,
      text: "Storm",
    },
  ],
});
