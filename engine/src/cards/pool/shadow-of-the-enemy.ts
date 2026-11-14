import { defineCard } from "../define.js";

// EDHREC rank 10450. A whole graveyard's creature cards exiled at once (rule
// 406), then a permission over the cards exiled this way for as long as each
// stays exiled (rule 400.7 ends it with any move), with mana of any type
// spendable on them (the "mana of any type" template: Mnemonic Betrayal).

export default defineCard({
  name: "Shadow of the Enemy",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile all creature cards from target player's graveyard. You may cast spells from among those cards for as long as they remain exiled, and mana of any type can be spent to cast them.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-graveyard", target: 0, filter: { type: "creature" } },
      { kind: "grant-play", cards: { thisWay: "exiled" }, duration: "while-exiled", spendAs: "any-type" },
    ],
  },
});
