import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// Playtest card. Subterranean Schooner's attack trigger, with cycling.

const ATTACK = "Whenever Leisure Bicycle attacks, target creature that crewed it this turn explores.";

export default defineCard({
  name: "Leisure Bicycle",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 2,
  toughness: 1,
  cycling: { cost: "{2}" },
  text: `${ATTACK}\nCrew 1\nCycling {2}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", crewedSource: true } }],
      effect: { kind: "explore", target: 0 },
      resolve: null,
      text: ATTACK,
    },
  ],
  activated: [crew(1)],
});
