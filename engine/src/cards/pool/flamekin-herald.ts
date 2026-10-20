import { defineCard } from "../define.js";

// EDHREC rank 8246.
//
// Rulings:
//   [2020-11-10] In some unusual situations, you may lose control of Flamekin Herald during the
//     process of casting a commander spell. In those situations, the commander spell won't have
//     cascade.
//   [2020-11-10] Once you announce that you're casting a commander spell, players can't take
//     action until you've finished casting it. Causing Flamekin Herald to leave the battlefield
//     after the spell has been cast won't stop its cascade ability from resolving.
//
// The First Sliver's granted cascade, on spells that are commanders.

const STATIC_TEXT = "Commander spells you cast have cascade.";

export default defineCard({
  name: "Flamekin Herald",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Wizard"],
  power: 3,
  toughness: 2,
  text: `${STATIC_TEXT} (Whenever you cast a commander, exile cards from the top of your library until you exile a nonland card with lesser mana value. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: {
        filter: { isCommander: true },
        triggered: [
          { trigger: { on: "this-cast" }, targets: [], effect: { kind: "cascade" }, resolve: null, text: "Cascade" },
        ],
      },
      text: STATIC_TEXT,
    },
  ],
});
