import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 9673.
//
// Rulings:
//   [2023-02-04] If the ability causes two Rebel tokens to be created (due to an effect such as
//     that of Mondrak, Glory Dominus), the Equipment becomes attached to only one of them.
//   [2023-02-04] If the Rebel is destroyed, the Equipment stays on the battlefield. Similarly, you
//     may pay its equip cost to move it from the Rebel token to another creature you control.
//   [2023-02-04] The Rebel enters the battlefield as a 2/2 creature, then the Equipment becomes
//     attached to it. Abilities that trigger when a creature enters the battlefield see that a 2/2
//     creature entered the battlefield.
//
// For Mirrodin! is Hexplate Wallbreaker's; "during your turn" is Ahn-Crop
// Invader's `your-turn` static condition, on the equipped creature.

const MIRRODIN_TEXT =
  "For Mirrodin! (When this Equipment enters, create a 2/2 red Rebel creature token, then attach this to it.)";
const GRANT_TEXT = "During your turn, equipped creature has first strike and trample.";

export default defineCard({
  name: "Hexgold Halberd",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${MIRRODIN_TEXT}\n${GRANT_TEXT}\nEquip {2}{R}`,
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike", "trample"],
      text: GRANT_TEXT,
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
  activated: [equip("{2}{R}")],
});
