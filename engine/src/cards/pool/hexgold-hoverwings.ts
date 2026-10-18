import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 12126.
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

// For Mirrodin! is Hexplate Wallbreaker's shape. "Creatures you control that
// are equipped" is Koll, the Forgemaster's `equipped` filter: equipped by
// any Equipment, this one or not.
const MIRRODIN_TEXT =
  "For Mirrodin! (When this Equipment enters, create a 2/2 red Rebel creature token, then attach this to it.)";
const FLYING_TEXT = "Equipped creature has flying.";
const ANTHEM_TEXT = "Creatures you control that are equipped get +1/+0.";

export default defineCard({
  name: "Hexgold Hoverwings",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${MIRRODIN_TEXT}\n${FLYING_TEXT}\n${ANTHEM_TEXT}\nEquip {2}{W}`,
  static: [
    { affects: { scope: "attached" }, grantKeywords: ["flying"], text: FLYING_TEXT },
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", equipped: true } },
      grantPt: [1, 0],
      text: ANTHEM_TEXT,
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
      text: MIRRODIN_TEXT,
    },
  ],
  activated: [equip("{2}{W}")],
});
