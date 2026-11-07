import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Marvel Super Heroes (MSH). EDHREC rank 4768.
//
// "Defending player" is the attack trigger's player — the one the equipped
// creature attacks, or the controller of the planeswalker it attacks
// (`whose: "trigger-player"`, as Thunder Lasso). The Equipment itself isn't
// attacking, so `"creature-defending-player-controls"` (which reads the
// ability's source) can't name them. A tapped creature can be targeted.

const STATIC_TEXT = "Equipped creature gets +0/+8 and has vigilance.";
const ATTACK_TEXT = "Whenever equipped creature attacks, tap target creature defending player controls.";

export default defineCard({
  name: "Captain America's Shield",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["indestructible"],
  text: `Indestructible\n${STATIC_TEXT}\n${ATTACK_TEXT}\nEquip {2}`,
  activated: [equip("{2}")],
  static: [{ affects: { scope: "attached" }, grantPt: [0, 8], grantKeywords: ["vigilance"], text: STATIC_TEXT }],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
