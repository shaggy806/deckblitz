import { defineCard } from "../define.js";

// EDHREC rank 26243. Amonkhet. Rohirrim Chargers' exert and Vizier of the
// True's "whenever you exert a creature" — this one or any other you control
// (the ruling); the rummage is Improvised Act's.

const EXERT_TEXT = "You may exert this creature as it attacks.";
const TRIGGER = "Whenever you exert a creature, you may discard a card. If you do, draw a card.";

export default defineCard({
  name: "Battlefield Scavenger",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Jackal", "Rogue"],
  power: 2,
  toughness: 2,
  text: `${EXERT_TEXT} (It won't untap during your next untap step.)\n${TRIGGER}`,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: EXERT_TEXT }],
  triggered: [
    {
      trigger: { on: "exerted", who: "you-control" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
          ],
        },
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
