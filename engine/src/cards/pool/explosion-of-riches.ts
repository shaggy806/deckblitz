import { defineCard } from "../define.js";

// EDHREC rank 13540. You draw, then each other player in turn order says
// whether they'll draw, and those who said yes do (the ruling;
// `each-player-may`). "Each other player" is each opponent: the engine has no
// teams. Then a reflexive ability (rule 603.12) triggers once for each card
// drawn while it resolved — `times` `{ thisWay: "drawn" }`, every player's
// draws, a replaced draw not counting (rule 121.6) — each put on the stack
// with its own random target (`targetsAtRandom`, rule 603.3d), after the
// spell has finished resolving.

const TEXT =
  "Draw a card, then each other player may draw a card. Whenever a card is drawn this way, Explosion of Riches deals 5 damage to target opponent chosen at random from among your opponents.";

export default defineCard({
  name: "Explosion of Riches",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      {
        kind: "each-player-may",
        who: "each-opponent",
        prompt: "Draw a card?",
        effect: { kind: "draw", amount: 1 },
      },
      {
        kind: "reflexive-trigger",
        times: { thisWay: "drawn" },
        targets: ["opponent"],
        targetsAtRandom: true,
        effect: { kind: "damage", amount: 5, target: 0 },
        text: "Whenever a card is drawn this way, Explosion of Riches deals 5 damage to target opponent chosen at random from among your opponents.",
      },
    ],
  },
});
