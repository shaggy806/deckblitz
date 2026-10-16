import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 9578.
//
// Rulings:
//   [2024-07-05] You lose only 2 life when Cleopatra's last ability resolves regardless of how
//     many counters the legendary creature that died had on it.
// Allies is Felidar Savior's two distinct optional slots, over any legendary
// creature but Cleopatra. Betrayal is Felisa, Fang of Silverquill's shape: the
// "with counters on it" filter and the count (every kind) both read the
// creature as it last existed on the battlefield; any player's creature counts.

const ALLIES_TEXT =
  "Allies — At the beginning of your end step, put a +1/+1 counter on each of up to two other target legendary creatures.";
const BETRAYAL_TEXT =
  "Betrayal — Whenever a legendary creature with counters on it dies, draw a card for each counter on it. You lose 2 life.";

export default defineCard({
  name: "Cleopatra, Exiled Pharaoh",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 2,
  toughness: 4,
  text: `${ALLIES_TEXT}\n${BETRAYAL_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: distinctTargets(
        2,
        { kind: "other", of: { kind: "permanent", filter: { type: "creature", supertype: "legendary" } } },
        { optional: true },
      ),
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: ALLIES_TEXT,
    },
    {
      trigger: {
        on: "dies",
        who: "any",
        filter: { type: "creature", supertype: "legendary", counters: { compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: { countersOn: "trigger-object" } },
          { kind: "lose-life", amount: 2 },
        ],
      },
      resolve: null,
      text: BETRAYAL_TEXT,
    },
  ],
});
