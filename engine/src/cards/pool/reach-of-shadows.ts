import { defineCard } from "../define.js";

export default defineCard({
  name: "Reach of Shadows",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature that's one or more colors.",
  targets: [
    {
      kind: "permanent",
      filter: {
        type: "creature",
        anyOf: [{ colors: ["W"] }, { colors: ["U"] }, { colors: ["B"] }, { colors: ["R"] }, { colors: ["G"] }],
      },
    },
  ],
  effect: { kind: "destroy", target: 0 },
});
