import { defineCard } from "../define.js";

export default defineCard({
  name: "Infestation Expert",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 3,
  toughness: 4,
  keywords: ["daybound"],
  text: "Whenever this creature enters or attacks, create a 1/1 green Insect creature token.\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Insect Token", count: 1 },
      resolve: null,
      text: "Whenever this creature enters or attacks, create a 1/1 green Insect creature token.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Insect Token", count: 1 },
      resolve: null,
      text: "Whenever this creature enters or attacks, create a 1/1 green Insect creature token.",
    },
  ],
  faces: ["Infestation Expert", "Infested Werewolf"],
  transform: true,
});
