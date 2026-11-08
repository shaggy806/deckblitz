import { defineCard } from "../define.js";

// EDHREC rank 31242.

export default defineCard({
  name: "Duct Crawler",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  text: "{1}{R}: Target creature can't block this creature this turn.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: [{ kind: "cant-block", attacker: "source" }]},
      resolve: null,
      text: "{1}{R}: Target creature can't block this creature this turn.",
    },
  ],
});
