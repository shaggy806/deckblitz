import { defineCard } from "../define.js";

// EDHREC rank 12483.
//
// The d8 is rolled as the cost is paid (rule 602.2b, 601.2h), so the roll is
// the ability's own: activated again in response, each resolves with its own
// result (the ruling). It can be activated once it's monstrous: the die is
// rolled, and nothing else happens.

const MONSTROSITY_TEXT =
  "{6}, Roll a d8: Monstrosity X, where X is the result. (If this creature isn't monstrous, put X +1/+1 counters on it and it becomes monstrous.)";
const BERSERK_TEXT = "Berserk — When this creature becomes monstrous, destroy target permanent.";

export default defineCard({
  name: "Clay Golem",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 4,
  toughness: 4,
  text: `${MONSTROSITY_TEXT}\n${BERSERK_TEXT}`,
  activated: [
    {
      cost: { mana: "{6}", tap: false, do: { kind: "roll-dice", sides: 8 } },
      targets: [],
      effect: { kind: "monstrosity", amount: { roll: "total" } },
      resolve: null,
      text: MONSTROSITY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "event", event: "becomes-monstrous", who: "self" },
      targets: ["permanent"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: BERSERK_TEXT,
    },
  ],
});
