import { defineCard } from "../define.js";

// EDHREC rank 27342.

export default defineCard({
  name: "War Machine, James Rhodes",
  manaCost: "{3}{W/U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Hero"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying (This creature can't be blocked except by creatures with flying or reach.)\nWhenever War Machine attacks, tap up to one target creature.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "Whenever War Machine attacks, tap up to one target creature.",
    },
  ],
});
