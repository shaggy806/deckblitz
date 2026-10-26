import { defineCard } from "../define.js";

export default defineCard({
  name: "Enshrined Memories",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Reveal the top X cards of your library. Put all creature cards revealed this way into your hand and the rest on the bottom of your library in any order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: "x",
    reveal: true,
    min: "x",
    max: "x",
    filter: { type: "creature" },
    destination: "hand",
    leftover: "bottom-any-order",
  },
});
