import { defineCard } from "../define.js";

const TEXT =
  "When Zero enters, look at target opponent's hand. You may exile a nonland card from it. For as long as that card remains exiled, its owner may play it. A spell cast this way costs {2} more to cast.";

export default defineCard({
  name: "Zero, Incorporeal Sensate",
  manaCost: "{1}{W/B}{W/B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Medusan", "Scientist"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      // Elite Spellbinder's ability, word for word.
      effect: {
        kind: "discard-chosen",
        target: 0,
        filter: { notTypes: ["land"] },
        lookOnly: true,
        optional: true,
        destination: "exile",
        unlinked: true,
        mayPlay: { duration: "while-exiled", play: true, byOwner: true, tax: { generic: 2 } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
