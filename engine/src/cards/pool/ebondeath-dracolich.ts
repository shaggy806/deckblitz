import { defineCard } from "../define.js";

// EDHREC rank 6911.
//
// Rulings:
//   [2021-07-23] Ebondeath, Dracolich's last ability cares only whether a creature not named
//     Ebondeath, Dracolich died during the turn, even if Ebondeath, Dracolich wasn't in your
//     graveyard when that happened. It doesn't matter if a creature named Ebondeath, Dracolich
//     also died, and it doesn't matter what happens to the creature after it dies. For example, if
//     the creature that died is a token or the creature card leaves the graveyard later in the
//     turn, you can still cast Ebondeath, Dracolich.
//   [2021-07-23] Casting Ebondeath, Dracolich from your graveyard follows the normal rules for
//     casting that card. You must pay its costs, and you must follow all applicable timing rules.
//   [2021-07-23] Ebondeath Dracolich cares what the creature's name was while it was last on the
//     battlefield, not what it is in the graveyard. For example, if a creature with a different
//     name becomes a copy of Ebondeath, Dracolich and then dies, you won't be able to cast
//     Ebondeath, Dracolich from your graveyard.

export default defineCard({
  name: "Ebondeath, Dracolich",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Dragon"],
  power: 5,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: "Flash\nFlying\nEbondeath enters tapped.\nYou may cast this card from your graveyard if a creature not named Ebondeath, Dracolich died this turn.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "Ebondeath enters tapped.",
    },
  ],
  // Any creature that died this turn, under anyone's control, read as it
  // last existed on the battlefield — a token counts, and so does one that
  // has left the graveyard since; one that was a copy of Ebondeath doesn't
  // (the rulings).
  castFromGraveyardIf: {
    kind: "turn-history",
    what: "died",
    who: "any-player",
    filter: { notName: "Ebondeath, Dracolich" },
  },
});
