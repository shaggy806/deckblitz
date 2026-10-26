import { defineCard } from "../define.js";

// EDHREC rank 30931.
//
// Rulings:
//   [2011-01-01] The triggered ability is mandatory. If you control three or more artifacts as
//     Lumengrid Drake enters, you must target a creature. If there are no other creatures on the
//     battlefield, you must target Lumengrid Drake itself. As the ability resolves, if you control
//     three or more artifacts, you must return the targeted creature to its owner's hand.

export default defineCard({
  name: "Lumengrid Drake",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nMetalcraft — When this creature enters, if you control three or more artifacts, return target creature to its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "metalcraft" },
      targets: ["creature"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "Metalcraft — When this creature enters, if you control three or more artifacts, return target creature to its owner's hand.",
    },
  ],
});
