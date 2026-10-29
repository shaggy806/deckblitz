import { defineCard } from "../define.js";

// EDHREC rank 22155. Loyal Sentry's "blocks a creature" trigger object; the
// blocked creature gains Steel Dromedary's conditional "doesn't untap" (a
// granted static) and Land Cap's upkeep counter removal (a granted trigger),
// both for good — "your" in each is that creature's controller's.

const TEXT =
  'Whenever this creature blocks a creature, put four fungus counters on that creature. The creature gains "This creature doesn\'t untap during your untap step if it has a fungus counter on it" and "At the beginning of your upkeep, remove a fungus counter from this creature."';

export default defineCard({
  name: "Mindbender Spores",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus", "Wall"],
  power: 0,
  toughness: 1,
  keywords: ["defender", "flying"],
  text: `Defender (This creature can't attack.)\nFlying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "trigger-object", counter: "fungus", amount: 4 },
          {
            kind: "grant-static",
            target: "trigger-object",
            ability: {
              affects: { scope: "self" },
              condition: { kind: "self-counters", counter: "fungus", compare: { op: "gte", n: 1 } },
              doesntUntap: true,
              text: "This creature doesn't untap during your untap step if it has a fungus counter on it.",
            },
            duration: "permanent",
          },
          {
            kind: "grant-triggered",
            target: "trigger-object",
            ability: {
              trigger: { on: "step-begins", step: "upkeep", who: "you" },
              targets: [],
              effect: { kind: "remove-counter", target: "source", counter: "fungus", amount: 1 },
              resolve: null,
              text: "At the beginning of your upkeep, remove a fungus counter from this creature.",
            },
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
