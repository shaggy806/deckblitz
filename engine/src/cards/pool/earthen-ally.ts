import { defineCard } from "../define.js";

// EDHREC rank 16692.
//
// Rulings:
//   [2025-11-21] Earthen Ally's first ability can give it at most +5/+0, that is, +1/+0 each for
//     white, blue, black, red, and green. "Gold," "multicolor," and "colorless" aren't colors.
//
// Faeburrow Elder's `colorsAmong`, over Allies: Earthen Ally is one, so its
// own green counts.
const PT_TEXT = "This creature gets +1/+0 for each color among Allies you control.";
const BEND_TEXT =
  "{2}{W}{U}{B}{R}{G}: Earthbend 5. (Target land you control becomes a 0/0 creature with haste that's still a land. Put five +1/+1 counters on it. When it dies or is exiled, return it to the battlefield tapped.)";

export default defineCard({
  name: "Earthen Ally",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Ally"],
  power: 0,
  toughness: 2,
  text: `${PT_TEXT}\n${BEND_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { colorsAmong: { subtype: "Ally", controlledBy: "you" }, pt: [1, 0] },
      text: PT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{W}{U}{B}{R}{G}", tap: false },
      targets: ["land-you-control"],
      effect: { kind: "earthbend", target: 0, amount: 5 },
      resolve: null,
      text: "{2}{W}{U}{B}{R}{G}: Earthbend 5.",
    },
  ],
});
