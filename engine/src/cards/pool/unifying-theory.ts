import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 25511. Paralyze's "that player may pay {N}. If the
// player does, …" asked of the spell's caster (Oppression's
// `"trigger-controller"`), and the draw is theirs.

const TEXT = "Whenever a player casts a spell, that player may pay {2}. If the player does, they draw a card.";

export default defineCard({
  name: "Unifying Theory",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "trigger-controller",
        prompt: "Pay {2} to draw a card?",
        options: [{ pay: "{2}", text: "Pay {2} to draw a card" }],
        ifDid: { kind: "draw", amount: 1, who: "that-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
