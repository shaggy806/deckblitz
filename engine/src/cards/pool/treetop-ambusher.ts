import { defineCard } from "../define.js";

// EDHREC rank 27202.

export default defineCard({
  name: "Treetop Ambusher",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Berserker"],
  power: 2,
  toughness: 1,
  dash: { cost: "{1}{G}" },
  text: "Dash {1}{G} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)\nWhenever this creature attacks, target creature you control gets +1/+1 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, target creature you control gets +1/+1 until end of turn.",
    },
  ],
});
