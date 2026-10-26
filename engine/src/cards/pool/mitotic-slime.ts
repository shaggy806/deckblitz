import { defineCard } from "../define.js";

// EDHREC rank 8413. Magic 2011. The two 2/2s carry their own dies trigger
// (each makes two vanilla 1/1 Oozes).
const TEXT =
  'When this creature dies, create two 2/2 green Ooze creature tokens. They have "When this token dies, create two 1/1 green Ooze creature tokens."';

export default defineCard({
  name: "Mitotic Slime",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "2/2 Splitting Ooze Token", count: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
