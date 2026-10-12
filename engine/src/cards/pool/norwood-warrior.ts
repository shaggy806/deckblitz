import { defineCard } from "../define.js";

export default defineCard({
  name: "Norwood Warrior",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature becomes blocked, it gets +1/+1 until end of turn.",
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature becomes blocked, it gets +1/+1 until end of turn.",
    },
  ],
});
