import { defineCard } from "../define.js";

// EDHREC rank 4035.
//
// Rulings:
//   [2023-09-01] Any target Equipment cards that can't legally be attached to the creature will
//     enter the battlefield unattached.

export default defineCard({
  name: "Unfinished Business",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Return target creature card from your graveyard to the battlefield, then return up to two target Aura and/or Equipment cards from your graveyard to the battlefield attached to that creature. (If the Auras can't enchant that creature, they remain in your graveyard.)",
  // The creature first, then each Aura and Equipment attached to it: an
  // Aura that can't enchant it stays in the graveyard, an Equipment that
  // can't equip it enters unattached (the reminder text, the ruling; rules
  // 303.4i, 301.5e) — as it does if the creature didn't make it.
  targets: [
    { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
    {
      kind: "optional",
      of: { kind: "card-in-graveyard", whose: "you", filter: { subtypes: ["Aura", "Equipment"] } },
    },
    {
      kind: "optional",
      of: { kind: "card-in-graveyard", whose: "you", filter: { subtypes: ["Aura", "Equipment"] } },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "put-onto-battlefield", target: 1, attachedTo: 0 },
      { kind: "put-onto-battlefield", target: 2, attachedTo: 0 },
    ],
  },
});
