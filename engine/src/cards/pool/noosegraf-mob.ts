import { defineCard } from "../define.js";

const CAST_TEXT =
  "Whenever a player casts a spell, remove a +1/+1 counter from this creature. If you do, create a 2/2 black Zombie creature token.";

// The removal isn't optional, and with the Mob gone or out of +1/+1 counters
// there's nothing to remove and no Zombie (the rulings).
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
