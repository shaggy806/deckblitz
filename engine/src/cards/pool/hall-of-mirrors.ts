import { defineCard } from "../define.js";
import { visit } from "../helpers.js";

// An Attraction (rule 717): it starts in its owner's Attraction deck, and goes
// to their junkyard rather than a graveyard, hand or library (717.6).
// Loki, Lord of Misrule's shape.

const VISIT = "Choose target creature you control. Each other creature you control becomes a copy of that creature until end of turn, except it isn't legendary.";

export default defineCard({
  name: "Hall of Mirrors",
  types: ["artifact"],
  subtypes: ["Attraction"],
  text: `Visit — ${VISIT}`,
  attractionLights: [
    { collector: "216a", lights: [2, 6] },
    { collector: "216b", lights: [4, 6] },
  ],
  triggered: [
    visit(
      {
        kind: "become-copy",
        filter: { type: "creature", controlledBy: "you" },
        exceptOf: true,
        of: 0,
        until: "end-of-turn",
        exceptions: { removeSupertypes: ["legendary"] },
      },
      VISIT,
      ["creature-you-control"],
    ),
  ],
});
