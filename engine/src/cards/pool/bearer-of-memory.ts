import { defineCard } from "../define.js";

const PUMP_TEXT = "{5}{G}: Put a +1/+1 counter on target enchantment creature. It gains trample until end of turn.";

export default defineCard({
  name: "Bearer of Memory",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Monk"],
  power: 3,
  toughness: 2,
  text: PUMP_TEXT,
  activated: [
    {
      cost: { mana: "{5}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { types: ["enchantment", "creature"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
