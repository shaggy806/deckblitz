import { defineCard } from "../define.js";

// EDHREC rank 21864.

const TEXT =
  "Whenever Brad Boimler becomes tapped, until end of turn, if one or more counters would be put on a permanent you control, that many plus one of each of those kinds of counters are put on that permanent instead.";

// A replacement effect made by the trigger (rule 614.1a), lasting the turn
// whatever becomes of Boimler; each one made adds one more.
export default defineCard({
  name: "Brad Boimler, Eager Ensign",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "replacement-effect",
        replacement: { event: "would-add-counter", instead: { modify: { plus: 1 } }, filter: { controlledBy: "you" } },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
