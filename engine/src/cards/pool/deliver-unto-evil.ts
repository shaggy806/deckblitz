import { defineCard } from "../define.js";

// EDHREC rank 13792. With no Bolas planeswalker as it resolves, the opponent the
// caster chooses picks two of the still-legal targets to stay; the rest go to
// hand (`choose-among-targets`). With no target still legal it doesn't resolve
// and isn't exiled (the ruling: `exileOnResolve` only as it resolves).

export default defineCard({
  name: "Deliver Unto Evil",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose up to four target cards in your graveyard. If you control a Bolas planeswalker, return those cards to your hand. Otherwise, an opponent chooses two of them. Leave the chosen cards in your graveyard and put the rest into your hand.\nExile Deliver Unto Evil.",
  targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you" }, max: 4 }],
  exileOnResolve: true,
  effect: {
    kind: "conditional",
    condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Bolas" }, atLeast: 1 },
    then: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "return-to-hand", target: 0, from: "graveyard" } },
    else: {
      kind: "choose-opponent",
      then: {
        kind: "choose-among-targets",
        chooser: "that-player",
        count: 2,
        prompt: "Choose the two cards that stay in the graveyard",
        rest: { effect: { kind: "return-to-hand", target: 0, from: "graveyard" } },
      },
    },
  },
});
