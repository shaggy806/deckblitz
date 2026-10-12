import { defineCard } from "../define.js";

export default defineCard({
  name: "Storm-Charged Slasher",
  art: "https://cards.scryfall.io/art_crop/back/a/3/a33af331-0746-4adf-935a-bf61ff9d8d4b.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 3,
  toughness: 4,
  keywords: ["nightbound"],
  text: "At the beginning of combat on your turn, target creature you control gets +2/+0 and gains trample and haste until end of turn.\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "At the beginning of combat on your turn, target creature you control gets +2/+0 and gains trample and haste until end of turn.",
    },
  ],
  faces: ["Reckless Stormseeker", "Storm-Charged Slasher"],
  transform: true,
});
