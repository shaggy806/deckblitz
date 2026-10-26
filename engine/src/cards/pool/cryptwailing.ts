import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 31701.
//
// Dimir Guildmage's sorcery-speed discard, with an exile-from-graveyard cost.

const TEXT =
  "{1}, Exile two creature cards from your graveyard: Target player discards a card. Activate only as a sorcery.";

export default defineCard({
  name: "Cryptwailing",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, exileFromGraveyard: { count: 2, filter: { type: "creature" } } },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 1 },
      sorcerySpeed: true,
      resolve: null,
      text: TEXT,
    },
  ],
});
