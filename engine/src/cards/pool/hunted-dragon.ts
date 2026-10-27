import { defineCard } from "../define.js";

// EDHREC rank 13117.
//
// Rulings:
//   [2005-10-01] The tokens are the color white and have name and creature type Knight. They are
//     *not* functionally identical to the card White Knight.

const TRIGGER = "When this creature enters, target opponent creates three 2/2 white Knight creature tokens with first strike.";

export default defineCard({
  name: "Hunted Dragon",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "create-token", token: "Knight Token (first strike)", count: 3, who: "target-controller" },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
