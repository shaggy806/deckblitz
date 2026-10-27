import { defineCard } from "../define.js";

// EDHREC rank 20587. A Spellshaper.

const TEXT = "{1}{W}, {T}, Discard a card: Destroy target artifact or enchantment.";

export default defineCard({
  name: "Devout Witness",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true, discard: { count: 1 } },
      targets: ["artifact-or-enchantment"],
      resolve: null,
      effect: { kind: "destroy", target: 0 },
      text: TEXT,
    },
  ],
});
