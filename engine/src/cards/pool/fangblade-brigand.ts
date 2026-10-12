import { defineCard } from "../define.js";

export default defineCard({
  name: "Fangblade Brigand",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 3,
  toughness: 4,
  keywords: ["daybound"],
  text: "{1}{R}: This creature gets +1/+0 and gains first strike until end of turn.\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 1,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword",
            target: "source",
            keyword: "first-strike",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "{1}{R}: This creature gets +1/+0 and gains first strike until end of turn.",
    },
  ],
  faces: ["Fangblade Brigand", "Fangblade Eviscerator"],
  transform: true,
});
