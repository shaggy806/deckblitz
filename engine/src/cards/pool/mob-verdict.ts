import { defineCard } from "../define.js";

// Each player must vote for another player (the ruling). "2 damage for each
// vote" is one instance of damage — twice the votes — dealt to the player
// and each creature they control at once. Opponents in turn order, then
// your draw.

const TEXT =
  "Secret council — Each player secretly votes for another player, then those votes are revealed. For each vote an opponent received, Mob Verdict deals 2 damage to that player and each creature that player controls. For each vote you received, draw a card.";
const DAMAGE = { product: [2, { votesReceived: "that-player" }] } as const;

export default defineCard({
  name: "Mob Verdict",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", for: { player: "another" }, secret: true },
      {
        kind: "for-each-voted",
        which: "voted",
        who: "each-opponent",
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "damage", amount: DAMAGE, who: "that-player" },
            { kind: "damage-all", filter: { type: "creature" }, amount: DAMAGE, whose: "that-player" },
          ],
        },
      },
      {
        kind: "for-each-voted",
        which: "voted",
        who: "you",
        effect: { kind: "draw", amount: { votesReceived: "that-player" } },
      },
    ],
  },
});
