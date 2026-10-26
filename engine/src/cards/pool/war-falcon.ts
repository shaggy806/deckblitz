import { defineCard } from "../define.js";

// EDHREC rank 29363.
//
// Rulings:
//   [2012-07-01] If an effect makes War Falcon a Knight or a Soldier, it will be able to attack
//     even if it's the only creature you control.
//   [2012-07-01] To attack with War Falcon, you must control a Knight or a Soldier when you
//     declare attackers. Once War Falcon is attacking, it won't be removed from combat if at any
//     point you no longer control a Knight or Soldier.
//
// `countsSelf`: the Falcon itself counts once it's a Knight or a Soldier (the
// first ruling). A `cant-attack` restriction is asked as attackers are
// declared, so it never removes an attacker (the second).

const TEXT = "This creature can't attack unless you control a Knight or a Soldier.";

export default defineCard({
  name: "War Falcon",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "not",
        of: { kind: "controls", filter: { subtypes: ["Knight", "Soldier"] }, atLeast: 1, countsSelf: true },
      },
      restrictions: ["cant-attack"],
      text: TEXT,
    },
  ],
});
