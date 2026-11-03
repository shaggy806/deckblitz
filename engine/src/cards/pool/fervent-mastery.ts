import { defineCard } from "../define.js";

// "If the {2}{R}{R} cost was paid": the card's own alternative cost, not
// another effect's. "An opponent" isn't a target: the caster chooses as it
// resolves.

export default defineCard({
  name: "Fervent Mastery",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "You may pay {2}{R}{R} rather than pay this spell's mana cost.\nIf the {2}{R}{R} cost was paid, an opponent discards any number of cards, then draws that many cards.\nSearch your library for up to three cards, put them into your hand, shuffle, then discard three cards at random.",
  alternativeCost: { mana: "{2}{R}{R}" },
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "self-alternative-cost-paid" },
        then: {
          kind: "choose-opponent",
          then: {
            kind: "as-player",
            who: "that-player",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "discard", target: "you", amount: 0, anyNumber: true },
                { kind: "draw", amount: { thisWay: "discarded" } },
              ],
            },
          },
        },
      },
      { kind: "search-library", filter: {}, destination: "hand", min: 0, max: 3 },
      { kind: "discard", target: "you", amount: 3, random: true },
    ],
  },
});
