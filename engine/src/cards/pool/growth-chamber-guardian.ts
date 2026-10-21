import { defineCard } from "../define.js";

// Ravnica Allegiance. Adapt is the `self-counters` conditional (Skitter Eel);
// the search fires on any +1/+1 counters put on it, entering with them
// included (the ruling — `counters-put`).
const ADAPT_TEXT = "{2}{G}: Adapt 2. (If this creature has no +1/+1 counters on it, put two +1/+1 counters on it.)";
const SEARCH_TEXT =
  "Whenever one or more +1/+1 counters are put on this creature, you may search your library for a card named Growth-Chamber Guardian, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Growth-Chamber Guardian",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Crab", "Warrior"],
  power: 2,
  toughness: 2,
  text: `${ADAPT_TEXT}\n${SEARCH_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      },
      resolve: null,
      text: ADAPT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "counters-put", who: "self", counter: "+1/+1" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a card named Growth-Chamber Guardian?",
        effect: {
          kind: "search-library",
          filter: { name: "Growth-Chamber Guardian" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
});
