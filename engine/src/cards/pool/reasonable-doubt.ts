import { defineCard } from "../define.js";

const COUNTER_TEXT = "Counter target spell unless its controller pays {2}.";
const SUSPECT_TEXT = "Suspect up to one target creature. (A suspected creature has menace and can't block.)";

export default defineCard({
  name: "Reasonable Doubt",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `${COUNTER_TEXT}\n${SUSPECT_TEXT}`,
  // The spell target is required, so it can't be cast only to suspect (the
  // ruling); the creature is optional.
  targets: ["spell", { kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      { kind: "suspect", target: 1 },
    ],
  },
});
