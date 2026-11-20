import { defineCard } from "../define.js";

// Visions. EDHREC rank 15597.
//
// The draw becomes an effect (rule 614.1a) with the drawing player as
// `"trigger-player"`: they draw a card — a new draw, which this replacement
// doesn't replace again (rule 614.5) but another may — and reveal it; a
// creature card drawn this way is then discarded unless its owner pays 3 life
// (`for-each-unless` over `{ drawn }`, Sirocco's shape). A draw of several is
// replaced one card at a time (614.11a). From an empty library nothing is
// drawn and the player has tried to draw from it (704.5b).

const TEXT =
  "If a player would draw a card, instead they draw a card and reveal it. If it's a creature card, that player discards it unless they pay 3 life.";

export default defineCard({
  name: "Breathstealer's Crypt",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "any-player",
        instead: {
          effect: {
            kind: "sequence",
            effects: [
              { kind: "draw", amount: 1, who: "trigger-player" },
              { kind: "reveal-drawn" },
              {
                kind: "for-each-unless",
                of: { drawn: { type: "creature" } },
                asks: "owner",
                options: [{ payLife: 3, text: "Pay 3 life to keep {it}" }],
                otherwise: { kind: "discard-card", target: 0 },
              },
            ],
          },
        },
      },
      text: TEXT,
    },
  ],
});
