import { defineCard } from "../define.js";

export default defineCard({
  name: "Sustainer of the Realm",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature blocks, it gets +0/+2 until end of turn.",
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 0, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature blocks, it gets +0/+2 until end of turn.",
    },
  ],
});
