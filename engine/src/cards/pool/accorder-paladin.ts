import { defineCard } from "../define.js";

export default defineCard({
  name: "Accorder Paladin",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 1,
  text: "Battle cry (Whenever this creature attacks, each other attacking creature gets +1/+0 until end of turn.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: "Battle cry",
    },
  ],
});
