import { defineCard } from "../define.js";

// Tempt with Vengeance's tempting offer: each opponent is asked in turn order
// (the ruling, rule 101.4), knowing the answers before theirs, and one who
// accepts draws and makes their own Rabbit ("you" inside `each-player-may`'s
// `effect` is them). Once all have answered, `ifDid` gives you a card and a
// Rabbit for each who did. Draws by several players go one player at a time
// anyway (rule 121.2c). An opponent with an empty library may still accept
// (121.3); one who can't draw can't (`mayBeDone`).
const DRAW_AND_RABBIT = {
  kind: "sequence",
  effects: [
    { kind: "draw", amount: 1 },
    { kind: "create-token", token: "Rabbit Token", count: 1 },
  ],
} as const;

export default defineCard({
  name: "Tempt with Bunnies",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text:
    "Tempting Offer — Draw a card and create a 1/1 white Rabbit creature token. Then each opponent may draw a card and create a 1/1 white Rabbit creature token. For each opponent who does, you draw a card and you create a 1/1 white Rabbit creature token.",
  effect: {
    kind: "sequence",
    effects: [
      DRAW_AND_RABBIT,
      {
        kind: "each-player-may",
        who: "each-opponent",
        prompt: "Draw a card and create a 1/1 white Rabbit creature token?",
        effect: DRAW_AND_RABBIT,
        ifDid: DRAW_AND_RABBIT,
      },
    ],
  },
});
