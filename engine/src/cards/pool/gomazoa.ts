import { defineCard } from "../define.js";

// "On top … then those players shuffle" is shuffling it in, as Void Stalker's.
// Not blocking: only Gomazoa goes (the ruling).
const TEXT = "{T}: Put this creature and each creature it's blocking on top of their owners' libraries, then those players shuffle.";

export default defineCard({
  name: "Gomazoa",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Jellyfish"],
  power: 0,
  toughness: 3,
  keywords: ["defender", "flying"],
  text: `Defender, flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          {
            kind: "for-each-permanent",
            filter: { type: "creature", blockingRelation: { relation: "blocked-by" } },
            simultaneous: true,
            effect: { kind: "shuffle-into-library", target: 0 },
          },
          { kind: "shuffle-into-library", target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
