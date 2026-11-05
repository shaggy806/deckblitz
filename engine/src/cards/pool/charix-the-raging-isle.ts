import { defineCard } from "../define.js";

// X is the Islands you control as the ability resolves, fixed from then on
// (the ruling).

const ISLANDS = { countOf: { subtype: "Island", controlledBy: "you" } } as const;
const PUMP_TEXT = "{3}: Charix gets +X/-X until end of turn, where X is the number of Islands you control.";

export default defineCard({
  name: "Charix, the Raging Isle",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Leviathan", "Crab"],
  power: 0,
  toughness: 17,
  text: `Spells your opponents cast that target Charix cost {2} more to cast.\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: ISLANDS,
        toughness: { product: [ISLANDS, -1] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      targetedBySpellsCost: { payGeneric: 2 },
      text: "Spells your opponents cast that target Charix cost {2} more to cast.",
    },
  ],
});
