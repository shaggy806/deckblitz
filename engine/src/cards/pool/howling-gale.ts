import { defineCard } from "../define.js";

// EDHREC rank 30645. Rockcaster Platoon's shape: one instruction, so the
// creatures and players are dealt damage at once.

export default defineCard({
  name: "Howling Gale",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  flashback: { cost: "{1}{G}" },
  text: "Howling Gale deals 1 damage to each creature with flying and each player.\nFlashback {1}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature", keyword: "flying" }, amount: 1 },
      { kind: "damage", amount: 1, who: "each-player" },
    ],
  },
});
