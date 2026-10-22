import { defineCard } from "../define.js";

// EDHREC rank 30628.
//
// Rulings:
//   For abilities that trigger only if you control a Desert or there is a
//   Desert card in your graveyard, one condition must be true as the ability
//   triggers and one must be true as the ability resolves. They don't have to
//   be the same condition, though.
//
// An intervening-if (rule 603.4), checked as it triggers and as it resolves.

const DIES =
  "When this creature dies, if you control a Desert or there is a Desert card in your graveyard, target player discards a card.";

export default defineCard({
  name: "Wretched Camel",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Camel"],
  power: 2,
  toughness: 1,
  text: DIES,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: {
        kind: "any",
        of: [
          { kind: "controls", filter: { subtype: "Desert" }, atLeast: 1 },
          { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Desert" } },
        ],
      },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 1 },
      resolve: null,
      text: DIES,
    },
  ],
});
