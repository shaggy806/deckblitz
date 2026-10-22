import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 10884.

const ATTACKS = "Whenever this Vehicle attacks, untap another target artifact or creature you control.";

export default defineCard({
  name: "Mobile Garrison",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 4,
  text: `${ATTACKS}\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  activated: [crew(2)],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        { kind: "other", of: { kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } } },
      ],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: ATTACKS,
    },
  ],
});
