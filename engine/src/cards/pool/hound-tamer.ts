import { defineCard } from "../define.js";

export default defineCard({
  name: "Hound Tamer",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 3,
  toughness: 3,
  keywords: ["trample", "daybound"],
  text: "Trample\n{3}{G}: Put a +1/+1 counter on target creature.\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{3}{G}: Put a +1/+1 counter on target creature.",
    },
  ],
  faces: ["Hound Tamer", "Untamed Pup"],
  transform: true,
});
