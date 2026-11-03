import { defineCard } from "../define.js";

const CHARGE_TEXT =
  "Whenever a player casts an instant or sorcery spell, put a number of charge counters on this artifact equal to that spell's mana value.";
const FRACTAL_TEXT =
  "{6}, {T}, Remove all charge counters from this artifact: Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it, where X is the number of charge counters removed this way.";

export default defineCard({
  name: "Geometric Nexus",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${CHARGE_TEXT}\n${FRACTAL_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: { manaValueOf: "trigger-object" } },
      resolve: null,
      text: CHARGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{6}", tap: true, removeCounter: { kind: "charge", count: "all" } },
      targets: [],
      effect: { kind: "create-token", token: "Fractal Token", count: 1, thenCounters: { kind: "+1/+1", amount: "x" } },
      resolve: null,
      text: FRACTAL_TEXT,
    },
  ],
});
