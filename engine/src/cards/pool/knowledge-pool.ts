import { defineCard } from "../define.js";

// Rulings:
//   [2011-06-01] The first triggered ability to resolve will exile the original spell, then the
//     player who cast that spell may cast one of the nonland cards exiled by the Knowledge Pool
//     that generated that triggered ability. The abilities of other Knowledge Pools will do
//     nothing when they resolve, as the original spell will already have been exiled.
//   [2011-06-01] Timing restrictions based on the card's type are ignored.
//   [2011-06-01] The spell a player casts from their hand won't resolve if it's exiled, even if
//     that spell can't be countered by spells or abilities.
//   [2011-06-01] If the original spell isn't exiled (perhaps because it's countered by another
//     spell or ability before Knowledge Pool's second triggered ability resolves), the rest of the
//     ability does nothing. The player doesn't get to cast an exiled card.
//   [2011-06-01] You may cast any other card exiled by Knowledge Pool, including one owned by an
//     opponent. Any card exiled by Knowledge Pool's "enters" ability or its other triggered
//     ability may be cast.
//   [2011-06-01] If there are no nonland cards exiled by Knowledge Pool, the original spell is
//     still exiled.
//
// Imprint links the abilities (rule 607.2a): both exile with this artifact, and
// the cast comes from among the cards exiled with it — the spell just exiled
// left out ("other"). "That player" casts it (cast-now's `by`); `cast-now` offers
// only spells, so a land exiled here is never cast.

const IMPRINT = "Imprint — When this artifact enters, each player exiles the top three cards of their library.";
const POOL =
  "Whenever a player casts a spell from their hand, that player exiles it. If the player does, they may cast a spell from among other cards exiled with this artifact without paying its mana cost.";

export default defineCard({
  name: "Knowledge Pool",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: `${IMPRINT}\n${POOL}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "exile-from-library", whose: "each-player", amount: 3, linked: true },
      resolve: null,
      text: IMPRINT,
    },
    {
      trigger: { on: "cast-spell", who: "any", from: "hand" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object", linked: true },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled" },
            then: { kind: "cast-now", from: "exiled-with-source", others: true, by: "trigger-player", free: true },
          },
        ],
      },
      resolve: null,
      text: POOL,
    },
  ],
});
