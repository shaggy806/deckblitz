import { defineCard } from "../define.js";

export default defineCard({
  name: "Child of the Pack",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 2,
  toughness: 5,
  keywords: ["daybound"],
  text: "{2}{R}{G}: Create a 2/2 green Wolf creature token.\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  activated: [
    {
      cost: { mana: "{2}{R}{G}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 1 },
      resolve: null,
      text: "{2}{R}{G}: Create a 2/2 green Wolf creature token.",
    },
  ],
  faces: ["Child of the Pack", "Savage Packmate"],
  transform: true,
});
