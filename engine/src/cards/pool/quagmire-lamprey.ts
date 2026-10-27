import { defineCard } from "../define.js";

const TEXT = "Whenever this creature becomes blocked by a creature, put a -1/-1 counter on that creature.";

export default defineCard({
  name: "Quagmire Lamprey",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Fish"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
