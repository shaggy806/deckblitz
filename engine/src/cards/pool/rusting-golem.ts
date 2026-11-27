import { defineCard } from "../define.js";

// Planar Chaos (PLC). Fading 5 (rule 702.32) as its two pieces, Ancient
// Hydra's. Its last fade counter removed, it is a 0/0 and dies to the
// state-based action (rule 704.5f) a turn before fading would sacrifice it.

const FADING_UPKEEP =
  "(This creature enters with five fade counters on it. At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.)";
const CDA = "Rusting Golem's power and toughness are each equal to the number of fade counters on it.";

export default defineCard({
  name: "Rusting Golem",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 0,
  toughness: 0,
  text: `Fading 5 ${FADING_UPKEEP}\n${CDA}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "fade", amount: 5 } },
      text: "Fading 5",
    },
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countersOnThis: "fade" }, plusPower: 0, plusToughness: 0 },
      text: CDA,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "fade", compare: { op: "gte", n: 1 } },
        then: { kind: "remove-counter", target: "source", counter: "fade", amount: 1 },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: FADING_UPKEEP,
    },
  ],
});
