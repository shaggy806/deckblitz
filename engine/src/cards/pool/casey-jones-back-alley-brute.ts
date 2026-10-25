import { defineCard } from "../define.js";

// EDHREC rank 7255. "Whenever you put one or more +1/+1 counters on a
// creature you control" is counters *you* put (`byYou` — Stocking the
// Pantry's wording), once per creature per event; "that much" is how many
// were put (the trigger value — Shalai and Hallar).
const COUNTER_TEXT =
  "Whenever you put one or more +1/+1 counters on a creature you control, Casey Jones deals that much damage to target opponent.";

export default defineCard({
  name: "Casey Jones, Back Alley Brute",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 4,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\nWhenever Casey Jones attacks, put a +1/+1 counter on target attacking creature.\n${COUNTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever Casey Jones attacks, put a +1/+1 counter on target attacking creature.",
    },
    {
      trigger: { on: "counters-put", who: "you-control", counter: "+1/+1", filter: { type: "creature" }, byYou: true },
      targets: ["opponent"],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
