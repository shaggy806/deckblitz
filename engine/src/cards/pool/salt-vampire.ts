import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, look at target opponent's hand. You may choose a nonland card from it. If you do, that player exiles that card, then draws a card.";

export default defineCard({
  name: "Salt Vampire",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Shapeshifter"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      // "If you do": the draw only follows a card actually exiled.
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "discard-chosen",
            target: 0,
            filter: { notTypes: ["land"] },
            lookOnly: true,
            optional: true,
            destination: "exile",
            unlinked: true,
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", atLeast: 1 },
            then: { kind: "draw", amount: 1, target: 0 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
