import { defineCard } from "../define.js";

const ENTERS_TEXT = "When Tamiyo enters, you become the monarch.";
const DAMAGE_TEXT =
  "Whenever one or more creatures deal combat damage to you while you're the monarch, tap those creatures and put a stun counter on each of them.";

// The batched damage trigger's sources as "those creatures"
// (`LastKnownRefs.dealtTogether`, a filter's `triggerBatch` — B278). "While
// you're the monarch" is part of the trigger condition (rule 603.1), asked
// only as the damage is dealt.
export default defineCard({
  name: "Tamiyo, Upriser Crowned",
  manaCost: "{4}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Warrior"],
  power: 3,
  toughness: 5,
  keywords: ["flying", "double-strike", "haste"],
  text: `Flying, double strike, haste\n${ENTERS_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "deals-damage-batch", who: "any", filter: { type: "creature" }, to: "you", combat: true },
      whileCondition: { kind: "monarch", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap-all", filter: { triggerBatch: true } },
          { kind: "add-counter-all", filter: { triggerBatch: true }, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
