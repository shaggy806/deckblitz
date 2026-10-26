import { defineCard } from "../define.js";

// EDHREC rank 25462.
//
// Rulings:
//   [2012-07-01] Multiple instances of lifelink aren't cumulative. Activating Arctic Aven's
//     ability more than once during a single turn won't cause you to gain more life.

const PLAINS_TEXT = "This creature gets +1/+1 as long as you control a Plains.";

export default defineCard({
  name: "Arctic Aven",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nThis creature gets +1/+1 as long as you control a Plains.\n{W}: This creature gains lifelink until end of turn. (Damage dealt by this creature also causes you to gain that much life.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Plains" }, atLeast: 1 },
      grantPt: [1, 1],
      text: PLAINS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: "{W}: This creature gains lifelink until end of turn.",
    },
  ],
});
