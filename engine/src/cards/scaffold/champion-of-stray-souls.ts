import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 15014.
//
// Rulings:
//   [2014-02-01] The last ability can be activated only if Champion of Stray Souls is in your
//     graveyard.
//   [2014-02-01] You choose the targets of the first ability as you activate that ability, before
//     you pay any costs. You can't target any of the creatures you sacrifice.

export default defineCard({
  name: "Champion of Stray Souls",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Warrior"],
  power: 4,
  toughness: 4,
  text: "{3}{B}{B}, {T}, Sacrifice X other creatures: Return X target creature cards from your graveyard to the battlefield.\n{5}{B}{B}: Put this card from your graveyard on top of your library.",
  activated: [
    {
      cost: { mana: "{5}{B}{B}", tap: false },
      targets: [],
      effect: null,
      resolve: null,
      text: "{5}{B}{B}: Put this card from your graveyard on top of your library.",
      // TODO(scaffold): Put ~ from your graveyard on top of your library.
    },
  ],
  // TODO(scaffold): {3}{B}{B}, {T}, Sacrifice X other creatures: Return X target creature cards from your graveyard to the battlefield.
});
