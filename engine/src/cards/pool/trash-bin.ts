import { defineCard } from "../define.js";
import { visit } from "../helpers.js";

// An Attraction (rule 717): it starts in its owner's Attraction deck, and goes
// to their junkyard rather than a graveyard, hand or library (717.6).

const VISIT = "Mill two cards, then return a card at random from your graveyard to your hand. (To mill a card, a player puts the top card of their library into their graveyard.)";

export default defineCard({
  name: "Trash Bin",
  types: ["artifact"],
  subtypes: ["Attraction"],
  text: `Visit — ${VISIT}`,
  attractionLights: [
    { collector: "232a", lights: [2, 6] },
    { collector: "232b", lights: [3, 6] },
    { collector: "232c", lights: [4, 6] },
    { collector: "232d", lights: [5, 6] },
  ],
  triggered: [
    visit(
      {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 2 },
          {
            kind: "choose-random-card",
            zone: "graveyard",
            then: { kind: "return-to-hand", target: 0, from: "graveyard" },
          },
        ],
      },
      VISIT,
    ),
  ],
});
