import { defineCard } from "../define.js";

export default defineCard({
  name: "Skilled Battlecarver",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 1,
  text: "During your turn, this creature has first strike.\n{1}{R}: This creature gets +1/+0 until end of turn.",
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
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike"],
      text: "During your turn, this creature has first strike.",
    },
  ],
});
