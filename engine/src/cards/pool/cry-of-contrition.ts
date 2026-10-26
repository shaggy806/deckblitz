import { defineCard } from "../define.js";
import { hauntSpell } from "../helpers.js";

// Haunt (rule 702.55): exiled haunting a creature, its last ability
// triggers from exile when that creature dies.
//
// EDHREC rank 24066.

export default defineCard({
  name: "Cry of Contrition",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards a card.\nHaunt (When this spell card is put into a graveyard after resolving, exile it haunting target creature.)\nWhen the creature this card haunts dies, target player discards a card.",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: 1 },
  triggered: [
    hauntSpell(),
    {
      trigger: { on: "haunted-dies" },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 1 },
      resolve: null,
      text: "When the creature this card haunts dies, target player discards a card.",
    },
  ],
});
