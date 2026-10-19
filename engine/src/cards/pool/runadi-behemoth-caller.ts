import { defineCard } from "../define.js";

// EDHREC rank 7805.
//
// The cast trigger marks the spell (Wildgrowth Archaic's shape) to enter with
// its mana value minus 4 counters, the mana value read off the spell on the
// stack as the trigger resolves (an {X} counts there — rule 202.3e).
const CAST_TEXT =
  "Whenever you cast a creature spell with mana value 5 or greater, that creature enters with X additional +1/+1 counters on it, where X is its mana value minus 4.";
const HASTE_TEXT = "Creatures you control with three or more +1/+1 counters on them have haste.";

export default defineCard({
  name: "Runadi, Behemoth Caller",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Shaman"],
  power: 1,
  toughness: 3,
  text: `${CAST_TEXT}\n${HASTE_TEXT}\n{T}: Add {G}.`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: {
          type: "creature",
          controlledBy: "you",
          counters: { kind: "+1/+1", compare: { op: "gte", n: 3 } },
        },
      },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { type: "creature", manaValue: { op: "gte", n: 5 } },
      },
      targets: [],
      effect: {
        kind: "enters-with-counters",
        target: "trigger-object",
        counter: "+1/+1",
        amount: { difference: [{ manaValueOf: "trigger-object" }, 4] },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
  ],
});
