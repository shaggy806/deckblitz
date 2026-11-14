import { defineCard } from "../define.js";

// EDHREC rank 7253.
//
// "Clash with defending player" names the opponent instead of choosing one
// (rule 701.30b): the player Marvo attacks, or the one whose planeswalker or
// battle it attacks (508.5), as it was if it has been removed from combat.
// Either clash a player wins counts for the second ability, whoever started
// it (the `clashes` trigger).

const ATTACK_TEXT = "Whenever Marvo attacks, clash with defending player.";
const WIN_TEXT =
  "Whenever you win a clash, draw a card. Then you may cast a spell from your hand with mana value 8 or less without paying its mana cost.";

export default defineCard({
  name: "Marvo, Deep Operative",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Octopus", "Rogue"],
  power: 1,
  toughness: 8,
  text: `${ATTACK_TEXT} (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)\n${WIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "clash", with: { defendingPlayerOf: "source" } },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "clashes", who: "you", won: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "cast-now", from: "hand", free: true, spell: { manaValue: { op: "lte", n: 8 } } },
        ],
      },
      resolve: null,
      text: WIN_TEXT,
    },
  ],
});
