import { defineCard } from "../define.js";

export default defineCard({
  name: "Ground Rift",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Target creature without flying can't block this turn.\nStorm (When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the copies.)",
  targets: [{ kind: "permanent", filter: { type: "creature", notKeyword: "flying" } }],
  effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "storm" },
      resolve: null,
      text: "Storm (When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the copies.)",
    },
  ],
});
