import { defineCard } from "../define.js";

// EDHREC rank 10245.
// Makes Rebel → use "Rebel Token".
//
// Rulings:
//   [2023-02-04] If the Rebel is destroyed, the Equipment stays on the battlefield. Similarly, you
//     may pay its equip cost to move it from the Rebel token to another creature you control.
//   [2023-02-04] If the ability causes two Rebel tokens to be created (due to an effect such as
//     that of Mondrak, Glory Dominus), the Equipment becomes attached to only one of them.
//   [2023-02-04] The Rebel enters the battlefield as a 2/2 creature, then the Equipment becomes
//     attached to it. Abilities that trigger when a creature enters the battlefield see that a 2/2
//     creature entered the battlefield.

const PUMP_TEXT = "Equipped creature gets +1/+1 for each creature you control.";

export default defineCard({
  name: "Kemba's Banner",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text:
    "For Mirrodin! (When this Equipment enters, create a 2/2 red Rebel creature token, then attach this to it.)\n" +
    `${PUMP_TEXT}\nEquip {2}{W}`,
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}{W}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Rebel Token", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: "For Mirrodin!",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { type: "creature", controlledBy: "you" }, pt: [1, 1] },
      text: PUMP_TEXT,
    },
  ],
});
