import { defineCard } from "../define.js";

// EDHREC rank 6778.
//
// X is this creature's power as it last existed on the battlefield — it was
// sacrificed to pay the cost, so its pumps from Spirits entering this turn
// count (rule 608.2h, Wall of Limbs' shape) — and the spell's controller
// decides (Judge's Familiar, Esper Sentinel).
const PUMP_TEXT = "Whenever another Spirit you control enters, this creature gets +1/+1 until end of turn.";
const COUNTER_TEXT =
  "Sacrifice this creature: Counter target instant or sorcery spell unless its controller pays {X}, " +
  "where X is this creature's power.";

export default defineCard({
  name: "Mausoleum Wanderer",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${PUMP_TEXT}\n${COUNTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Spirit" }, otherOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["instant-or-sorcery-spell"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ payGeneric: { powerOf: "source" }, text: "Pay {X}." }],
        otherwise: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
