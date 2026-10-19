import { defineCard } from "../define.js";

// EDHREC rank 9914.
//
// Matter Absorption watches every artifact, anyone's, going to a graveyard or
// to exile from the battlefield (`leaves-battlefield` with `to`).
const SPEAR_TEXT =
  "Spear of the Void Dragon — Whenever this creature attacks, each opponent sacrifices a nonland permanent of their choice.";
const ABSORPTION_TEXT =
  "Matter Absorption — Whenever an artifact is put into a graveyard from the battlefield or is put into exile from the battlefield, put two +1/+1 counters on this creature.";

export default defineCard({
  name: "Shard of the Void Dragon",
  manaCost: "{4}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["C'tan"],
  power: 7,
  toughness: 7,
  keywords: ["flying"],
  text: `Flying\n${SPEAR_TEXT}\n${ABSORPTION_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "each-opponent", filter: { notTypes: ["land"] }, count: 1 },
      resolve: null,
      text: SPEAR_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "any", filter: { type: "artifact" }, to: ["graveyard", "exile"] },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: ABSORPTION_TEXT,
    },
  ],
});
