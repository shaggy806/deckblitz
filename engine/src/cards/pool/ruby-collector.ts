import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. Conjure is MTG Arena's (the `conjure`
// effect); "this ability triggers only once" is ever, for this object
// (`triggersOnlyOnce`).
const CONJURE_TEXT =
  "When you attack with three or more creatures, conjure a card named Mox Ruby into your hand. This ability triggers only once.";
const PUMP_TEXT = "{1}{R}: Creatures you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Ruby Collector",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 1,
  toughness: 1,
  text: `${CONJURE_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 3 },
      triggersOnlyOnce: true,
      targets: [],
      effect: { kind: "conjure", name: "Mox Ruby", to: "hand" },
      resolve: null,
      text: CONJURE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
