import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 27563. The Vehicles are counted as the trigger resolves, this
// one included (Surgehacker Mech's shape).

const SHOOT =
  "When this Vehicle enters, it deals X damage to up to one target creature, where X is twice the number of Vehicles you control.";

export default defineCard({
  name: "Sky Cycle",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${SHOOT}\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  activated: [crew(2)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "damage", target: 0, amount: { countOf: { subtype: "Vehicle", controlledBy: "you" }, times: 2 } },
      resolve: null,
      text: SHOOT,
    },
  ],
});
