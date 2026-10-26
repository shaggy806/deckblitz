import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 18815.
//
// Rulings:
//   [2006-07-15] The third time Woolly Razorback blocks, its last ice counter will be removed,
//     meaning the combat damage it deals that combat won't be prevented.
//   [2006-07-15] Having an ice counter on Woolly Razorback doesn't prevent combat damage that
//     would be dealt to it.
//
// The "as long as" is the static's condition on both halves: defender, and a
// combat-only prevention shield on damage it deals (`fromSelf` — Fog Bank's
// second half; nothing on damage dealt to it).

const ICE_TEXT =
  "As long as this creature has an ice counter on it, prevent all combat damage it would deal and it has defender.";
const HAS_ICE = { kind: "self-counters", counter: "ice", compare: { op: "gte", n: 1 } } as const;

export default defineCard({
  name: "Woolly Razorback",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Boar", "Beast"],
  power: 7,
  toughness: 7,
  text: `This creature enters with three ice counters on it.\n${ICE_TEXT}\nWhenever this creature blocks, remove an ice counter from it.`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "ice", amount: 1 },
      resolve: null,
      text: "Whenever this creature blocks, remove an ice counter from it.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "ice", amount: 3 } },
      text: "This creature enters with three ice counters on it.",
    },
    {
      affects: { scope: "self" },
      condition: HAS_ICE,
      grantKeywords: ["defender"],
      text: ICE_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: HAS_ICE,
      replacement: { event: "would-deal-damage", combat: true, prevent: true, fromSelf: true },
      text: ICE_TEXT,
    },
  ],
});
