import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 18297.
//
// Rulings:
//   [2014-02-01] The number of creature cards in your graveyard is counted only as the ability
//     resolves. Once the ability resolves, the bonus won't change, even if the number of creature
//     cards in your graveyard changes later in the turn.

export default defineCard({
  name: "Graverobber Spider",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 2,
  toughness: 4,
  keywords: ["reach"],
  text: "Reach\n{3}{B}: This creature gets +X/+X until end of turn, where X is the number of creature cards in your graveyard. Activate only once each turn.",
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false },
      targets: [],
      effect: null,
      resolve: null,
      text: "{3}{B}: This creature gets +X/+X until end of turn, where X is the number of creature cards in your graveyard. Activate only once each turn.",
      oncePerTurn: true,
      // TODO(scaffold): ~ gets +X/+X until end of turn, where X is the number of creature cards in your graveyard.
    },
  ],
});
