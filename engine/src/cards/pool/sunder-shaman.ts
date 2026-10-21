import { defineCard } from "../define.js";

// EDHREC rank 12883. With menace too, it can't be blocked at all (the
// ruling): two blockers are needed and at most one is allowed.
const BLOCK_TEXT = "This creature can't be blocked by more than one creature.";
const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, destroy target artifact or enchantment that player controls.";

export default defineCard({
  name: "Sunder Shaman",
  manaCost: "{R}{R}{G}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Giant", "Shaman"],
  power: 5,
  toughness: 5,
  text: `${BLOCK_TEXT}\n${DAMAGE_TEXT}`,
  static: [{ affects: { scope: "self" }, blockedByAtMostOne: true, text: BLOCK_TEXT }],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { typesAnyOf: ["artifact", "enchantment"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
