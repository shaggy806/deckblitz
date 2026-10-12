import { defineCard } from "../define.js";

export default defineCard({
  name: "Umbral Juke",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Choose one —\n• Target player sacrifices a creature or planeswalker of their choice.\n• Create a 2/1 white and black Inkling creature token with flying.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target player sacrifices a creature or planeswalker of their choice.",
        targets: ["player"],
        effect: {
          kind: "sacrifice",
          who: "target",
          filter: { typesAnyOf: ["creature", "planeswalker"] },
          count: 1,
        },
      },
      {
        text: "Create a 2/1 white and black Inkling creature token with flying.",
        effect: { kind: "create-token", token: "Inkling Token", count: 1 },
      },
    ],
  },
});
