import { defineCard } from "../define.js";

export default defineCard({
  name: "Burly Breaker",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 6,
  toughness: 5,
  keywords: ["daybound"],
  text: "Ward {1} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {1}.)\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{1}" } },
      resolve: null,
      text: "Ward {1}",
    },
  ],
  faces: ["Burly Breaker", "Dire-Strain Demolisher"],
  transform: true,
});
