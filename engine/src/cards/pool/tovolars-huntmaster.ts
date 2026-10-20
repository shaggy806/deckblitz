import { defineCard } from "../define.js";

export default defineCard({
  name: "Tovolar's Huntmaster",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 6,
  toughness: 6,
  keywords: ["daybound"],
  text: "When this creature enters, create two 2/2 green Wolf creature tokens.\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 2 },
      resolve: null,
      text: "When this creature enters, create two 2/2 green Wolf creature tokens.",
    },
  ],
  faces: ["Tovolar's Huntmaster", "Tovolar's Packleader"],
  transform: true,
});
