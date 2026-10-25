import { defineCard } from "../define.js";

// EDHREC rank 15424.
//
// Rulings:
//   [2016-11-08] Causing an opponent to lose the game after you've announced that you're casting a
//     spell with undaunted and determined its total cost won't cause you to have to pay more mana.
//   [2016-11-08] If each target is illegal as Seeds of Renewal resolves, Seeds of Renewal doesn't
//     resolve and is put into its owner's graveyard. It's not exiled.
//   [2016-11-08] Effects that reduce what you pay to cast a spell don't affect its mana value.
//   [2016-11-08] If one target becomes illegal before Seeds of Renewal resolves, you'll still
//     return the legal target from your graveyard to your hand.

export default defineCard({
  name: "Seeds of Renewal",
  manaCost: "{6}{G}",
  colors: ["G"],
  types: ["sorcery"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { opponents: true },
  },
  text: "Undaunted (This spell costs {1} less to cast for each opponent.)\nReturn up to two target cards from your graveyard to your hand. Exile Seeds of Renewal.",
  targets: [
    { kind: "optional", of: { kind: "card-in-graveyard", whose: "you" } },
    { kind: "optional", of: { kind: "other", of: { kind: "card-in-graveyard", whose: "you" }, than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "return-to-hand", target: 1, from: "graveyard" },
    ],
  },
  exileOnResolve: true,
});
