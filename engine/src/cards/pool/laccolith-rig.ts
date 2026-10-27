import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 22065.
//
// Rulings:
//   [2004-10-04] The ability is optional. You can decide to allow it to deal combat damage as
//     normal.
//   [2004-10-04] It can target any creature on the battlefield, not just one of the ones blocking
//     it.
//   [2004-10-04] If this is on an opponent's creature, the controller of this card (not the
//     creature's controller) decides whether to use this card's ability or not, and decides what
//     the target will be.
//   [2006-10-15] Moving the enchantment after the ability triggers will not affect which creatures
//     are affected.
//
// Gaze of Pain's shape on an Aura: "it" and "the first creature" are the
// trigger object — the creature that became blocked — not whatever the Aura
// is attached to by the time this resolves. The `may` is the Aura's
// controller's.

const TEXT =
  "Whenever enchanted creature becomes blocked, you may have it deal damage equal to its power to target creature. If you do, the first creature assigns no combat damage this turn.";

export default defineCard({
  name: "Laccolith Rig",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "attached" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have the enchanted creature deal damage equal to its power to the targeted creature? It then assigns no combat damage.",
        effect: { kind: "damage", target: 0, amount: { powerOf: "trigger-object" }, from: "trigger-object" },
        then: { kind: "assigns-no-combat-damage", target: "trigger-object" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
