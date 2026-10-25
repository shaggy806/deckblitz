import { defineCard } from "../define.js";

// EDHREC rank 15652.
//
// A token copy copies only the copiable values (rule 707.2): no counters and
// no monstrous designation, so the token can become monstrous itself and make
// another (the ruling).

const MONSTROSITY_TEXT =
  "{4}{G}{G}: Monstrosity 3. (If this creature isn't monstrous, put three +1/+1 counters on it and it becomes monstrous.)";
const COPY_TEXT =
  "When this creature becomes monstrous, create a token that's a copy of this creature. (The token has no counters and isn't monstrous.)";

export default defineCard({
  name: "Splitting Slime",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 3,
  toughness: 3,
  text: `${MONSTROSITY_TEXT}\n${COPY_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}{G}{G}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 3 },
      resolve: null,
      text: MONSTROSITY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-monstrous", who: "self" },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1, who: "you" },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
