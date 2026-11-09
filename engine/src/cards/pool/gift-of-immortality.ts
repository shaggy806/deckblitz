import { defineCard } from "../define.js";

// EDHREC rank 1891. The delayed ability is about the permanent the creature came
// back as (`about`): a token that doesn't come back sets nothing up, and with the
// creature gone by the end step the Aura stays in the graveyard (the rulings).

const TEXT =
  "When enchanted creature dies, return that card to the battlefield under its owner's control. Return this card to the battlefield attached to that creature at the beginning of the next end step.";

export default defineCard({
  name: "Gift of Immortality",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: "trigger-object" },
          {
            kind: "delayed-trigger",
            at: { step: "end" },
            about: "put-onto-battlefield",
            effect: {
              kind: "conditional",
              condition: { kind: "source-zone", zones: ["graveyard"] },
              then: { kind: "put-onto-battlefield", target: "source", attachedTo: 0 },
            },
            text: "Return Gift of Immortality to the battlefield attached to that creature.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
