import { defineCard } from "../define.js";

// EDHREC rank 7061. Doubling is putting that many on (the ruling), so a Hardened
// Scales changes it; removal counts what came off.

const TEXT =
  "At the beginning of your upkeep, double the number of +1/+1 counters on Lily Bowen if its power is 16 or less. Otherwise, remove all but one +1/+1 counter from it, then you gain 1 life for each +1/+1 counter removed this way.";

export default defineCard({
  name: "Lily Bowen, Raging Grandma",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Warrior"],
  power: 0,
  toughness: 0,
  keywords: ["vigilance"],
  text: `Vigilance\nLily Bowen enters with two +1/+1 counters on it.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "Lily Bowen enters with two +1/+1 counters on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { power: { op: "lte", n: 16 } } },
        then: { kind: "double-counters", target: "source", counter: "+1/+1" },
        else: {
          kind: "sequence",
          effects: [
            {
              kind: "remove-counter",
              target: "source",
              counter: "+1/+1",
              amount: { difference: [{ countersOn: "source", counter: "+1/+1" }, 1] },
            },
            { kind: "gain-life", amount: { thisWay: "counters-removed" } },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
