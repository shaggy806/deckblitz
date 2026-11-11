import { defineCard } from "../define.js";

// EDHREC rank 5130.
//
// Rulings:
//   Gollum, Obsessed Stalker's last ability counts the total amount of life you gained without
//     taking into account any life you lost during that turn.
//   Gollum, Obsessed Stalker's last ability counts players who were dealt combat damage by any
//     creature named Gollum, Obsessed Stalker. It doesn't matter who controlled those creatures.
//
// "Dealt combat damage this game by a creature named …" is the journal's whole-game record
// (`combat-damaged-this-game`), asked of each opponent in turn; the amount is read as it resolves.

const DRAIN_TEXT =
  "At the beginning of your end step, each opponent dealt combat damage this game by a creature named Gollum, Obsessed Stalker loses life equal to the amount of life you gained this turn.";

export default defineCard({
  name: "Gollum, Obsessed Stalker",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Horror"],
  power: 1,
  toughness: 1,
  keywords: ["skulk"],
  text: `Skulk (This creature can't be blocked by creatures with greater power.)\n${DRAIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        effect: {
          kind: "conditional",
          condition: {
            kind: "of-player",
            player: "that-player",
            condition: { kind: "combat-damaged-this-game", byCreatureNamed: "Gollum, Obsessed Stalker" },
          },
          then: { kind: "lose-life", amount: { turnStat: "life-gained", who: "you" }, who: "that-player" },
        },
      },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
});
