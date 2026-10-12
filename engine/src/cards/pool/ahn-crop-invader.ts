import { defineCard } from "../define.js";

export default defineCard({
  name: "Ahn-Crop Invader",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Zombie", "Minotaur", "Warrior"],
  power: 2,
  toughness: 2,
  text: "During your turn, this creature has first strike.\n{1}, Sacrifice another creature: This creature gets +2/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}, Sacrifice another creature: This creature gets +2/+0 until end of turn.",
      otherOnly: true,
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
