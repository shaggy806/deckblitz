import { defineCard } from "../define.js";

export default defineCard({
  name: "Mnemonic Betrayal",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  exileOnResolve: true,
  text: "Exile all opponents' graveyards. You may cast spells from among those cards this turn, and mana of any type can be spent to cast them. At the beginning of the next end step, if any of those cards remain exiled, return them to their owners' graveyards.\nExile Mnemonic Betrayal.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-graveyard", target: "each-opponent" },
      { kind: "grant-play", cards: { thisWay: "exiled" }, duration: "end-of-turn", spendAs: "any-type" },
      {
        kind: "delayed-trigger",
        at: { step: "end" },
        about: "exiled",
        effect: { kind: "for-each-target", from: 0, effect: { kind: "put-into-graveyard", target: 0 } },
        text: "At the beginning of the next end step, if any of those cards remain exiled, return them to their owners' graveyards.",
      },
    ],
  },
});
