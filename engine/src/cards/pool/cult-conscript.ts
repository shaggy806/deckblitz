import { defineCard } from "../define.js";

// EDHREC rank 7604.
//
// Rulings:
//   [2022-09-09] Similarly, Cult Conscript didn't need to be any specific zone at the time that
//     creature died.
//   [2022-09-09] Creature tokens that die are put into your graveyard as normal (and cease to
//     exist soon after). If a non-Skeleton creature token died this turn, it satisfies the
//     activation restriction.
//   [2022-09-09] The creature that died doesn't have to still be in its owner's graveyard to
//     satisfy the activation restriction.
//
// The restriction reads the turn's deaths under its controller as each creature
// last existed (a token too), so neither where this card was then nor where the
// dead creature is now matters. It returns through its own "enters tapped".
const RETURN_TEXT =
  "{1}{B}: Return this card from your graveyard to the battlefield. Activate only if a non-Skeleton creature died under your control this turn.";

export default defineCard({
  name: "Cult Conscript",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Warrior"],
  power: 2,
  toughness: 1,
  text: `This creature enters tapped.\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      condition: {
        kind: "turn-history",
        what: "died",
        who: "you",
        filter: { type: "creature", notSubtypes: ["Skeleton"] },
      },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This creature enters tapped.",
    },
  ],
});
