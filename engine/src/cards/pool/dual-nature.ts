import { defineCard } from "../define.js";

const COPY = "Whenever a nontoken creature enters, its controller creates a token that's a copy of that creature.";
const NAMESAKES = "Whenever a nontoken creature leaves the battlefield, exile all tokens with the same name as that creature.";
const LEAVES = "When this enchantment leaves the battlefield, exile all tokens created with this enchantment.";

export default defineCard({
  name: "Dual Nature",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${COPY}\n${NAMESAKES}\n${LEAVES}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature", token: false } },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "trigger-controller",
        effect: { kind: "create-token-copy", of: "trigger-object", count: 1, who: "that-player", linkedToSource: true },
      },
      resolve: null,
      text: COPY,
    },
    {
      trigger: { on: "leaves-battlefield", who: "any", filter: { type: "creature", token: false } },
      targets: [],
      effect: { kind: "exile-all", filter: { token: true, sameNameAsTriggerObject: true } },
      resolve: null,
      text: NAMESAKES,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "exile-all", filter: { token: true, createdWithSource: true } },
      resolve: null,
      text: LEAVES,
    },
  ],
});
