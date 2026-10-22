import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 3214.
//
// Rulings:
//   When the second ability resolves, Endrek Sahr will be sacrificed regardless of how many Thrulls
//     you control at that time, even if it's less than seven.
//   The second ability is a state trigger. Once it triggers, it won't trigger again as long as the
//     ability is on the stack. If the ability is countered and the trigger condition is still
//     true, it will immediately trigger again.
//   Face-down spells are creature spells, but they have mana value 0.

const CAST =
  "Whenever you cast a creature spell, create X 1/1 black Thrull creature tokens, where X is that spell's mana value.";
const SEVEN = "When you control seven or more Thrulls, sacrifice Endrek Sahr.";

export default defineCard({
  name: "Endrek Sahr, Master Breeder",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${CAST}\n${SEVEN}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "create-token", token: "Thrull Token", count: { manaValueOf: "trigger-object" } },
      resolve: null,
      text: CAST,
    },
    {
      trigger: { on: "state", state: { kind: "controls", filter: { subtype: "Thrull" }, atLeast: 7 } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SEVEN,
    },
  ],
});
