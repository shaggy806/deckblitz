import { defineCard } from "../define.js";

// EDHREC rank 20266.
//
// Rulings:
//   You still control Captured by the Consulate when it's attached to an
//     opponent's creature: it triggers whenever *your* opponents cast a spell
//     with a single target.
//   An Aura spell targets the creature it will enchant, and may trigger it.
//   If the spell can't target the enchanted creature, its target remains
//     unchanged.
//   A spell with multiple targets doesn't have a single target even if the
//     same object is chosen for each of them.
//
// "If it has a single target" is an intervening if (rule 603.4) over the
// spell's targets as chosen (115.9a: `stackObjectTargets.count`), asked as it
// triggers and again as it resolves. "Change the target to enchanted
// creature if able" is `change-targets` `to: "attached"`: the one new target
// is the creature it enchants; if that isn't a legal target for the spell
// (or is already its target), nothing changes (rule 115.7a).

const ENCHANT_TEXT = "Enchant creature you don't control";
const ATTACK_TEXT = "Enchanted creature can't attack.";
const TRIGGER_TEXT =
  "Whenever an opponent casts a spell, if it has a single target, change the target to enchanted creature if able.";

export default defineCard({
  name: "Captured by the Consulate",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `${ENCHANT_TEXT}\n${ATTACK_TEXT}\n${TRIGGER_TEXT}`,
  targets: ["creature-an-opponent-controls"],
  static: [{ affects: { scope: "attached" }, restrictions: ["cant-attack"], text: ATTACK_TEXT }],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      condition: { kind: "trigger-object", filter: { stackObjectTargets: { count: 1 } } },
      targets: [],
      effect: { kind: "change-targets", target: "trigger-object", how: "change", to: "attached" },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
