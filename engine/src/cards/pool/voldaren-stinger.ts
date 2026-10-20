import { defineCard } from "../define.js";

export default defineCard({
  name: "Voldaren Stinger",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Warrior"],
  power: 1,
  toughness: 1,
  text: "This creature has first strike as long as it's attacking.\n{2}{R}: This creature gets +2/+0 until end of turn.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: true } },
      grantKeywords: ["first-strike"],
      text: "This creature has first strike as long as it's attacking.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{2}{R}: This creature gets +2/+0 until end of turn.",
    },
  ],
});
