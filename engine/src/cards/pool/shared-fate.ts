import { defineCard } from "../define.js";

const DRAW_TEXT =
  "If a player would draw a card, that player exiles the top card of one of their opponents' libraries face down instead.";
const PLAY_TEXT =
  "Each player may look at cards they exiled with this enchantment, and they may play lands and cast spells from among those cards.";

// EDHREC rank 14752. The drawing player chooses the opponent and exiles the
// card (`as-player`), so it's theirs to look at — and, once allowed to, they
// may go on looking (rule 406.3) — and theirs to play while this enchantment
// is the one it was exiled with (rule 607.2a): another Shared Fate later
// doesn't reach it (the ruling). Not optional, and with every opponent's
// library empty nothing is exiled, and nothing is drawn (the rulings). With
// two Shared Fates the drawing player chooses which replaces each draw.
export default defineCard({
  name: "Shared Fate",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${DRAW_TEXT}\n${PLAY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "any-player",
        instead: {
          effect: {
            kind: "as-player",
            who: "trigger-player",
            effect: {
              kind: "choose-opponent",
              then: { kind: "exile-from-library", whose: "that-player", amount: 1, faceDown: "looked", linked: true },
            },
          },
        },
      },
      text: DRAW_TEXT,
    },
    {
      affects: { scope: "self" },
      mayPlay: { from: "exile", play: true, filter: {}, linked: true, eachPlayer: true, exiledByYou: true },
      text: PLAY_TEXT,
    },
  ],
});
