import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of combat on your turn, put a +1/+1 counter on target creature you control. Then if that creature has toughness 6 or greater, transform this enchantment.";

export default defineCard({
  name: "Dormant Grove",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { toughness: { op: "gte", n: 6 } } },
            then: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Dormant Grove", "Gnarled Grovestrider"],
  transform: true,
});
