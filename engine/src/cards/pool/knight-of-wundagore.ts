import { defineCard } from "../define.js";

const TEXT = "Whenever you put a +1/+1 counter on another creature, put a +1/+1 counter on this creature. This ability triggers only once each turn.";

export default defineCard({
  name: "Knight of Wundagore",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat", "Knight", "Villain"],
  power: 2,
  toughness: 1,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "counters-put", who: "any", counter: "+1/+1", byYou: true, filter: { type: "creature", isSource: false } },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
