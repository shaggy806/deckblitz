import { defineCard } from "../define.js";

export default defineCard({
  name: "Feast of Blood",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Cast this spell only if you control two or more Vampires.\nDestroy target creature. You gain 4 life.",
  castOnlyIf: { kind: "controls", filter: { subtype: "Vampire" }, atLeast: 2 },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "gain-life", amount: 4 },
    ],
  },
});
