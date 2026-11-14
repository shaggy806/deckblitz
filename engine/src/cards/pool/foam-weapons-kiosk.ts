import { defineCard } from "../define.js";
import { visit } from "../helpers.js";

// An Attraction (rule 717): it starts in its owner's Attraction deck, and goes
// to their junkyard rather than a graveyard, hand or library (717.6).

const VISIT = "Put a +1/+1 counter on target creature you control. That creature gains vigilance until end of turn.";

export default defineCard({
  name: "Foam Weapons Kiosk",
  types: ["artifact"],
  subtypes: ["Attraction"],
  text: `Visit — ${VISIT}`,
  attractionLights: [
    { collector: "211a", lights: [2, 6] },
    { collector: "211b", lights: [3, 6] },
    { collector: "211c", lights: [4, 6] },
    { collector: "211d", lights: [5, 6] },
  ],
  triggered: [
    visit(
      {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      VISIT,
      ["creature-you-control"],
    ),
  ],
});
