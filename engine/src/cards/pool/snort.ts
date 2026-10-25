import { defineCard } from "../define.js";

// Each player chooses in turn, then everyone who said yes discards and draws
// at once (rule 101.4): a later player doesn't see an earlier one's hand go
// before choosing. Then each opponent who did is dealt 5 damage — you aren't,
// though you may wheel too.
const TEXT =
  "Each player may discard their hand and draw five cards. Then Snort deals 5 damage to each opponent who discarded their hand this way.";

export default defineCard({
  name: "Snort",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: { cost: "{5}{R}" },
  text: `${TEXT}\nFlashback {5}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)`,
  effect: {
    kind: "each-player-may",
    who: "each-player",
    prompt: "Discard your hand and draw five cards?",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "discard-hand", who: "you" },
        { kind: "draw", amount: 5 },
      ],
    },
    resultsFor: "each-opponent",
    ifDid: { kind: "damage", amount: 5, who: "that-player" },
  },
});
