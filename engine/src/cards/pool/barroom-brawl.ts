import { defineCard } from "../define.js";

// EDHREC rank 14098.
//
// Rulings:
//   Each copy of Barroom Brawl also includes the opportunity to create a copy, so as long as there
//     are legal targets available and the copies keep successfully resolving, the brawl can
//     continue.
//   If the opponent to your left chooses to copy Barroom Brawl but not change its targets, both
//     targets will probably be illegal as the copy tries to resolve, and the player to their left
//     will not be able to copy it.
//   If both targets are illegal as Barroom Brawl attempts to resolve, it does nothing. No copy will
//     be created.
//   In a two-player game, the other player is the opponent to your left.
//   If one target is legal and the other is not legal as Barroom Brawl resolves, neither creature
//     will deal damage. However, the opponent to your left may still choose to copy Barroom Brawl.
//
// "The opponent to your left" is the player to your left — the next in turn
// order still in the game (rule 101.4); there are no teams. The copy is that
// player's (rule 707.10), so its "you" and "your left" are theirs, and its own
// copy goes on round the table. The fight with one illegal target deals no
// damage (rule 701.14b); with both illegal the spell doesn't resolve (rule
// 608.2b), so nobody is offered a copy.

const TEXT =
  "Target creature you control fights target creature the opponent to your left controls. Then that player may copy this spell and may choose new targets for the copy.";

export default defineCard({
  name: "Barroom Brawl",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  targets: [
    "creature-you-control",
    { kind: "permanent", whose: "opponent", filter: { type: "creature", controlledBy: "player-to-your-left" } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "fight", a: 0, b: 1 },
      {
        kind: "each-player-may",
        who: "player-to-your-left",
        prompt: "Copy Barroom Brawl? (You may choose new targets for the copy.)",
        effect: { kind: "copy-spell", target: "source", newTargets: true },
      },
    ],
  },
});
