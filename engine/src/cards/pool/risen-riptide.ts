import { defineCard } from "../define.js";

// A kicked spell is one whose kicker cost was paid (rule 702.33d) — the
// `kicked` filter on the spell as it's cast. Base 5/5 is layer 7b, so
// counters and pumps still apply on top.

const TEXT = "Whenever you cast a kicked spell, this creature has base power and toughness 5/5 until end of turn.";

export default defineCard({
  name: "Risen Riptide",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { kicked: true } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 5,
        toughness: 5,
        addTypes: [],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
