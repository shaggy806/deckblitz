import { defineCard } from "../define.js";

// EDHREC rank 11059.
//
// Rulings:
//   - You can't remove more than one +1/+1 counter at once, and you can't
//     choose not to remove a counter.
//   - If Noosegraf Mob is no longer on the battlefield or no longer has +1/+1
//     counters on it as its triggered ability resolves, you can't remove a
//     counter from it and won't get a Zombie token.
//
// "Remove a counter. If you do" is gated on the Mob still being the same
// object on the battlefield with a +1/+1 counter, checked as it resolves.

const CAST_TEXT =
  "Whenever a player casts a spell, remove a +1/+1 counter from this creature. If you do, create a 2/2 black Zombie creature token.";

export default defineCard({
  name: "Noosegraf Mob",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 0,
  toughness: 0,
  text: `This creature enters with five +1/+1 counters on it.\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 5 } },
      text: "This creature enters with five +1/+1 counters on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source-on-battlefield" },
            { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
          ],
        },
        then: {
          kind: "sequence",
          effects: [
            { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 },
            { kind: "create-token", token: "Zombie Token", count: 1 },
          ],
        },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
