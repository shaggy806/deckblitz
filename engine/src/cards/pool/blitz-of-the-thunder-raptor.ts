import { defineCard } from "../define.js";

// Rulings:
//   [2020-04-17] Blitz of the Thunder-Raptor's replacement effect will exile the target creature or
//     planeswalker if it would die this turn for any reason, not just due to lethal damage. It
//     applies even if Blitz of the Thunder-Raptor deals no damage to it.
//   [2020-04-17] Blitz of the Thunder-Raptor is still on the stack while you determine how much
//     damage is dealt. It isn't in your graveyard to contribute to that amount of damage.

export default defineCard({
  name: "Blitz of the Thunder-Raptor",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Blitz of the Thunder-Raptor deals damage to target creature or planeswalker equal to the number of instant and sorcery cards in your graveyard. If that creature or planeswalker would die this turn, exile it instead.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "damage",
        amount: { countInGraveyard: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" } },
        target: 0,
      },
      { kind: "exile-if-dies-this-turn", target: 0 },
    ],
  },
});
