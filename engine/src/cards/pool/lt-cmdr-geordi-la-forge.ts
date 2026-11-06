import { defineCard } from "../define.js";

// EDHREC rank 25784.

const DOUBLE_TEXT =
  "If you would put one or more charge counters on an artifact you control, put twice that many charge counters on that artifact instead.";

export default defineCard({
  name: "Lt. Cmdr. Geordi La Forge",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 2,
  text: DOUBLE_TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-add-counter",
        multiplier: 2,
        whoPuts: "you",
        counterKind: "charge",
        filter: { type: "artifact", controlledBy: "you" },
      },
      text: DOUBLE_TEXT,
    },
  ],
});
