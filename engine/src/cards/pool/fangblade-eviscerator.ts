import { defineCard } from "../define.js";

export default defineCard({
  name: "Fangblade Eviscerator",
  art: "https://cards.scryfall.io/art_crop/back/d/2/d2feb859-bfae-4bc4-8181-5737dd5c3b08.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 4,
  toughness: 5,
  keywords: ["nightbound"],
  text: "{1}{R}: This creature gets +1/+0 and gains first strike until end of turn.\n{4}{R}: Creatures you control get +2/+0 until end of turn.\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
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
    {
      cost: { mana: "{4}{R}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{4}{R}: Creatures you control get +2/+0 until end of turn.",
    },
  ],
  faces: ["Fangblade Brigand", "Fangblade Eviscerator"],
  transform: true,
});
