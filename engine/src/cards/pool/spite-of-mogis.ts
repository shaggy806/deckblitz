import { defineCard } from "../define.js";

// The spell is on the stack as it resolves, so it never counts itself (the ruling).
export default defineCard({
  name: "Spite of Mogis",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Spite of Mogis deals damage to target creature equal to the number of instant and sorcery cards in your graveyard. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "damage",
        amount: { countInGraveyard: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" } },
        target: 0,
      },
      { kind: "scry", amount: 1 },
    ],
  },
});
