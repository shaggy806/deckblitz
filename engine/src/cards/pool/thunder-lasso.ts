import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 16301.
//
// Rulings:
//   [2024-04-12] You may target a creature that is already tapped with Thunder Lasso's third
//     ability.

const ATTACK_TEXT = "Whenever equipped creature attacks, tap target creature defending player controls.";

// "Defending player" is the attack trigger's player — the one the equipped
// creature attacks (or the controller of the planeswalker it attacks); the
// Equipment itself isn't attacking, so `"creature-defending-player-controls"`
// (which reads the ability's source) can't name them. A tapped creature can
// be targeted (the ruling).
export default defineCard({
  name: "Thunder Lasso",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `When this Equipment enters, attach it to target creature you control.\nEquipped creature gets +1/+1.\n${ATTACK_TEXT}\nEquip {2}`,
  activated: [equip("{2}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: "When this Equipment enters, attach it to target creature you control.",
    },
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Equipped creature gets +1/+1." }],
});
