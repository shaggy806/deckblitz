import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 17600.
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

// For Mirrodin! is Hexplate Wallbreaker's shape.
const MIRRODIN_TEXT =
  "For Mirrodin! (When this Equipment enters, create a 2/2 red Rebel creature token, then attach this to it.)";
const PUMP_TEXT = "Equipped creature gets +2/+0.";

export default defineCard({
  name: "Vulshok Splitter",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${MIRRODIN_TEXT}\n${PUMP_TEXT}\nEquip {2}{R} ({2}{R}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: PUMP_TEXT }],
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
      text: MIRRODIN_TEXT,
    },
  ],
  activated: [equip("{2}{R}")],
});
