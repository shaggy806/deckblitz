import { defineCard } from "../define.js";

// EDHREC rank 8454.
//
// Rulings:
//   [2015-08-25] If damage that can't be prevented is dealt to Undergrowth Champion while it has a
//     +1/+1 counter on it, you'll still remove a +1/+1 counter on it.
//   [2015-08-25] If Undergrowth Champion is dealt damage from multiple sources at the same time
//     (for example, if it's blocked by multiple creatures), its prevention effect will apply once
//     to all that damage. You'll remove only one +1/+1 counter.
//   [2024-11-08] A landfall ability triggers whenever a land you control enters for any reason. It
//     triggers whenever you play a land, as well as whenever a spell or ability puts a land onto
//     the battlefield under your control.
//   [2024-11-08] Whenever a land you control enters, each landfall ability of the permanents you
//     control will trigger. You can put them   on the stack in any order. The last ability you put
//     on the stack will be the first one to resolve (As a result, you can have those abilities
//     resolve in the order of your choosing.).
//   [2024-11-08] A landfall ability doesn't trigger if a permanent already on the battlefield
//     becomes a land.
// Oathsworn Knight's prevention: damage dealt at once is one event, so one counter goes
// (`perEvent`). No damage in the engine is unpreventable yet, so the first ruling can't arise.

const PREVENT_TEXT =
  "If damage would be dealt to this creature while it has a +1/+1 counter on it, prevent that damage and remove a +1/+1 counter from this creature.";
const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Undergrowth Champion",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 2,
  text: `${PREVENT_TEXT}\n${LANDFALL_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        perEvent: true,
        to: "self",
        then: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      text: PREVENT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
