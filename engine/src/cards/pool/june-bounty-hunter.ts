import { defineCard } from "../define.js";

// EDHREC rank 14280.
//
// Rulings:
//   [2025-11-21] If a card or ability instructs you to put cards into your hand without
//     specifically using the word "draw," it's not a card drawn.
//   [2025-11-21] Once June, Bounty Hunter has been blocked, drawing two or more cards will not
//     cause June to become unblocked.
//   [2025-11-21] Creating a Clue token this way isn't the same thing as investigating.
//
// The evasion is read live (Gwaihir the Windlord's `cards-drawn` turn stat):
// blocks are legal or not as they're declared, and a block already made
// stands.
const EVASION_TEXT = "June can't be blocked as long as you've drawn two or more cards this turn.";
const CLUE_TEXT =
  "{1}, Sacrifice another creature: Create a Clue token. Activate only during your turn. (It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "June, Bounty Hunter",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 2,
  toughness: 2,
  text: `${EVASION_TEXT}\n${CLUE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-stat", stat: "cards-drawn", who: "you", atLeast: 2 },
      grantKeywords: ["unblockable"],
      text: EVASION_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: "{1}, Sacrifice another creature: Create a Clue token. Activate only during your turn.",
      otherOnly: true,
      condition: { kind: "your-turn" },
    },
  ],
});
