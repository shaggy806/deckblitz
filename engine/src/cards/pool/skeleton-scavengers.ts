import { defineCard } from "../define.js";

// EDHREC rank 25159.
//
// "Pay {1} for each +1/+1 counter on this creature" is a mana cost fixed as
// the ability is activated (rule 602.2b, 601.2f): `{0}` and the ability's own
// `costIncrease` of {1} a counter — {0} with none, which is paid by paying
// nothing (rule 118.5). "When it regenerates this way" is a reflexive trigger
// the shield sets off (Matopi Golem's), so the counter comes after the
// regeneration and the next activation costs {1} more.

const ENTERS_TEXT = "This creature enters with a +1/+1 counter on it.";
const REGEN_TEXT =
  "Pay {1} for each +1/+1 counter on this creature: Regenerate this creature. When it regenerates this way, put a +1/+1 counter on it.";

export default defineCard({
  name: "Skeleton Scavengers",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 0,
  toughness: 0,
  text: `${ENTERS_TEXT}\n${REGEN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      costIncrease: { increaseGeneric: { countersOn: "source", counter: "+1/+1" } },
      targets: [],
      effect: {
        kind: "regenerate",
        target: "source",
        ifRegenerates: {
          kind: "reflexive-trigger",
          targets: [],
          effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          text: "When it regenerates this way, put a +1/+1 counter on it.",
        },
      },
      resolve: null,
      text: REGEN_TEXT,
    },
  ],
});
