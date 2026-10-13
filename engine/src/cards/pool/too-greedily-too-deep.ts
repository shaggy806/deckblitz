import { defineCard } from "../define.js";

// EDHREC rank 7114.
//
// Rulings:
//   [2023-06-16] If the card you return to the battlefield isn't a creature on the battlefield, it
//     has no power and therefore deals no damage.
//
// Vat Emergence's reanimation, then Chandra's Ignition's "deals damage equal
// to its power to each other creature" from the creature it returned (the
// target slot follows the card onto the battlefield, as Apprentice
// Necromancer's haste does).
const TEXT =
  "Put target creature card from a graveyard onto the battlefield under your control. That creature deals damage equal to its power to each other creature.";

export default defineCard({
  name: "Too Greedily, Too Deep",
  manaCost: "{5}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [{ kind: "card-in-graveyard", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      {
        kind: "damage-all",
        filter: { type: "creature" },
        amount: { powerOf: 0 },
        exceptSource: true,
        from: { target: 0 },
      },
    ],
  },
});
