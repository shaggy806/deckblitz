import { defineCard } from "../define.js";

// Revealed, not exiled, until the card found — which alone is exiled, with
// three time counters and suspend; the rest go to the bottom in a random order.
const FORESIGHT_TEXT =
  "Temporal Foresight — When this creature enters, reveal cards from the top of your library until you reveal a nonland card with mana value 3 or greater. Exile that card with three time counters on it. If it doesn't have suspend, it gains suspend. Put the rest of the revealed cards on the bottom of your library in a random order.";

export default defineCard({
  name: "Sibylline Soothsayer",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 2,
  text: FORESIGHT_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: { notTypes: ["land"], manaValue: { op: "gte", n: 3 } },
        then: { kind: "give-suspend", target: 0, timeCounters: 3 },
        rest: "bottom-random",
      },
      resolve: null,
      text: FORESIGHT_TEXT,
    },
  ],
});
