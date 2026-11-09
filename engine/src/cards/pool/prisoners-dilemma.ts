import { defineCard } from "../define.js";

// EDHREC rank 3670. Not a vote (`choose`), secret (`secret`): nobody sees a
// choice until they're all in. No opponent chose snitch means each chose
// silence; none chose silence means each chose snitch; otherwise 12 to each
// opponent who chose silence.

const TEXT =
  "Each opponent secretly chooses silence or snitch, then the choices are revealed. If each opponent chose silence, Prisoner's Dilemma deals 4 damage to each of them. If each opponent chose snitch, Prisoner's Dilemma deals 8 damage to each of them. Otherwise, Prisoner's Dilemma deals 12 damage to each opponent who chose silence.";

export default defineCard({
  name: "Prisoner's Dilemma",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `${TEXT}\nFlashback {5}{R}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)`,
  targets: [],
  flashback: { cost: "{5}{R}{R}" },
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "vote",
        choose: true,
        secret: true,
        who: "each-opponent",
        for: { options: ["silence", "snitch"] },
      },
      {
        kind: "conditional",
        condition: { kind: "amounts", left: { votesFor: 1 }, op: "eq", right: 0 },
        then: { kind: "damage", amount: 4, who: "each-opponent" },
        else: {
          kind: "conditional",
          condition: { kind: "amounts", left: { votesFor: 0 }, op: "eq", right: 0 },
          then: { kind: "damage", amount: 8, who: "each-opponent" },
          else: {
            kind: "for-each-vote",
            option: 0,
            effect: { kind: "damage", amount: 12, who: "that-player" },
          },
        },
      },
    ],
  },
});
