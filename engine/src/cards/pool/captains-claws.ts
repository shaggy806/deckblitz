import { defineCard } from "../define.js";

// EDHREC rank 10423.
// Makes Kor Ally → "Kor Ally Token".
//
// Rulings:
//   [2016-01-22] You choose which opponent or planeswalker controlled by an opponent the token is
//     attacking as it enters the battlefield. It doesn't have to be the same opponent or
//     planeswalker that the equipped creature is attacking.
//   [2016-01-22] The token is never declared as an attacking creature. It simply enters the
//     battlefield attacking. This won't cause any abilities that trigger "whenever a creature
//     attacks" to trigger.

const ATTACK_TEXT =
  "Whenever equipped creature attacks, create a 1/1 white Kor Ally creature token that's tapped and attacking.";

export default defineCard({
  name: "Captain's Claws",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+0.\n${ATTACK_TEXT}\nEquip {1}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      // Attacking whichever player or planeswalker its controller chooses as
      // it enters; never declared as an attacker (the rulings).
      effect: { kind: "create-token", token: "Kor Ally Token", count: 1, tapped: true, attacking: "choose" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], text: "Equipped creature gets +1/+0." }],
});
