import { defineCard } from "../define.js";

// EDHREC rank 13097. The card is exiled first; then the choice: the damage,
// equal to the exiled card's mana value, or — declining — a permission to
// play that card until end of turn, a land included (Synth Eradicator's
// shape). With the creature an illegal target, nothing happens at all, not
// even the exile (rule 608.2b — the rulings). An {X} in the exiled card's
// cost counts as 0 (rule 202.3e).

const TEXT =
  "Choose target creature. Exile the top card of your library. You may have Spark of Creativity deal damage to that creature equal to the exiled card's mana value. If you don't, you may play that card until end of turn.";

export default defineCard({
  name: "Spark of Creativity",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-from-library", amount: 1 },
      {
        kind: "may",
        prompt: "Have Spark of Creativity deal damage to the creature equal to the exiled card's mana value? (If you don't, you may play that card until end of turn.)",
        effect: {
          kind: "damage",
          target: 0,
          amount: { aggregate: "sum", of: "mana-value", filter: {}, in: { thisWay: "exiled" } },
        },
        else: { kind: "grant-play", cards: { thisWay: "exiled" }, play: true, duration: "end-of-turn" },
      },
    ],
  },
});
