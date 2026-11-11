import { defineCard } from "../define.js";
import { GIFT_KICKER } from "../helpers.js";

// Gift a card (rule 702.174e). Promised, the exiled card may be cast for as
// long as it remains exiled, mana of any type spending for it (rule 609.4b).
export default defineCard({
  name: "Cruelclaw's Heist",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Gift a card (You may promise an opponent a gift as you cast this spell. If you do, they draw a card before its other effects.)\n" +
    "Target opponent reveals their hand. You choose a nonland card from it. Exile that card. If the gift was promised, you may cast that card for as long as it remains exiled, and mana of any type can be spent to cast it.",
  targets: ["opponent"],
  effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, destination: "exile" },
  kicker: {
    ...GIFT_KICKER,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "gift", gift: "card" },
        {
          kind: "discard-chosen",
          target: 0,
          filter: { notTypes: ["land"] },
          destination: "exile",
          mayPlay: { duration: "while-exiled", spendAs: "any-type" },
        },
      ],
    },
  },
});
