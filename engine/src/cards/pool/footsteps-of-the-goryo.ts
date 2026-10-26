import { defineCard } from "../define.js";

// Saviors of Kamigawa. Apprentice Necromancer's shape: the delayed sacrifice
// follows the card the spell returned.
export default defineCard({
  name: "Footsteps of the Goryo",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: "Return target creature card from your graveyard to the battlefield. Sacrifice that creature at the beginning of the next end step.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "sacrifice-target", target: 0 },
        text: "Sacrifice the creature Footsteps of the Goryo returned to the battlefield.",
      },
    ],
  },
});
