import { defineCard } from "../define.js";

// Sixth Edition. Each player in turn order settles their own: which of a tie,
// then whether to pay that creature's mana cost (a token has none to pay, rule
// 118.6). The choices are made in turn order and then the sacrifices happen at
// once (rule 101.4): what each player keeps out is marked by `choicesHeld`, and
// no player's sacrifice shows before the last has answered.

export default defineCard({
  name: "Tariff",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Each player sacrifices the creature they control with the greatest mana value unless they pay that creature's mana cost. If two or more creatures a player controls are tied for greatest, that player chooses one.",
  targets: [],
  effect: {
    kind: "for-each-player",
    who: "each-player",
    choicesHeld: true,
    effect: {
      kind: "as-player",
      who: "that-player",
      effect: {
        kind: "choose-permanents",
        filter: {
          type: "creature",
          controlledBy: "you",
          greatestAmongItsController: { of: "mana-value", among: { type: "creature" } },
        },
        min: 1,
        upTo: 1,
        prompt: "Choose the creature you control with the greatest mana value",
        then: {
          kind: "unless",
          chooser: "you",
          options: [{ payManaCostOf: 0, text: "Pay {X}" }],
          otherwise: { kind: "sacrifice-target", target: 0 },
        },
      },
    },
  },
});
