import { defineCard } from "../define.js";

export default defineCard({
  name: "Crimson Muckwader",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 2,
  toughness: 1,
  text: "This creature gets +1/+1 as long as you control a Swamp.\n{2}{B}: Regenerate this creature. (The next time this creature would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{2}{B}: Regenerate this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Swamp" }, atLeast: 1 },
      grantPt: [1, 1],
      text: "This creature gets +1/+1 as long as you control a Swamp.",
    },
  ],
});
