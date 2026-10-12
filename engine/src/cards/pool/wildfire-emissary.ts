import { defineCard } from "../define.js";

export default defineCard({
  name: "Wildfire Emissary",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Efreet"],
  power: 2,
  toughness: 4,
  text: "Protection from white\n{1}{R}: This creature gets +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{R}: This creature gets +1/+0 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W"] },
      text: "Protection from white",
    },
  ],
});
