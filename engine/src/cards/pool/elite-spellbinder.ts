import { defineCard } from "../define.js";

export default defineCard({
  name: "Elite Spellbinder",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, look at target opponent's hand. You may exile a nonland card from it. For as long as that card remains exiled, its owner may play it. A spell cast this way costs {2} more to cast.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      resolve: null,
      text: "When this creature enters, look at target opponent's hand. You may exile a nonland card from it. For as long as that card remains exiled, its owner may play it. A spell cast this way costs {2} more to cast.",
      targets: ["opponent"],
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
    },
  ],
});
