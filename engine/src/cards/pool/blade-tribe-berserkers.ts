import { defineCard } from "../define.js";

// EDHREC rank 30669.
//
// Rulings:
//   [2011-01-01] Once the metalcraft ability resolves, Blade-Tribe Berserkers retains its bonuses
//     for the rest of the turn, even if you cease to control three or more artifacts for some
//     reason.

export default defineCard({
  name: "Blade-Tribe Berserkers",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 3,
  toughness: 3,
  text: "Metalcraft — When this creature enters, if you control three or more artifacts, this creature gets +3/+3 and gains haste until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "metalcraft" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 3, toughness: 3, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Metalcraft — When this creature enters, if you control three or more artifacts, this creature gets +3/+3 and gains haste until end of turn.",
    },
  ],
});
