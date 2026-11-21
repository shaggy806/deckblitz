import { defineCard } from "../define.js";

const TEXT =
  "When enchanted creature dies, you may put a creature card you own with lesser mana value from your hand or from the command zone onto the battlefield. If you do, return this card to the battlefield attached to that creature at the beginning of the next end step.";

// One choice over the hand and the cards you own in the command zone
// (`zone: "hand-and-command"`), the mana value compared with the creature's
// as it last existed (rule 608.2h). The delayed ability is about the creature
// put onto the battlefield (`about`): with nothing put, none is set up ("if
// you do"); with the creature or this card gone by the end step, nothing
// returns (Gift of Immortality's shape).
export default defineCard({
  name: "Next of Kin",
  manaCost: "{2}{G}",
  colors: ["G"],
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
          {
            kind: "look-and-choose",
            zone: "hand-and-command",
            min: 0,
            max: 1,
            destination: "battlefield",
            leftover: "stay",
            filter: {
              type: "creature",
              ownedBy: "you",
              manaValue: { op: "lt", n: { amount: { manaValueOf: "trigger-object" } } },
            },
            prompt: "Put a creature card with lesser mana value from your hand or the command zone onto the battlefield?",
          },
          {
            kind: "delayed-trigger",
            at: { step: "end" },
            about: "put-onto-battlefield",
            effect: {
              kind: "conditional",
              condition: { kind: "source-zone", zones: ["graveyard"] },
              then: { kind: "put-onto-battlefield", target: "source", attachedTo: 0 },
            },
            text: "Return Next of Kin to the battlefield attached to that creature.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
