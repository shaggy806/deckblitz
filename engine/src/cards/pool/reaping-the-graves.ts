import { defineCard } from "../define.js";

export default defineCard({
  name: "Reaping the Graves",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Return target creature card from your graveyard to your hand.\nStorm (When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the copies.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
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
