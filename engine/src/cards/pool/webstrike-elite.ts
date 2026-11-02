import { defineCard } from "../define.js";

const CYCLING_TEXT = "Cycling {X}{G}{G} ({X}{G}{G}, Discard this card: Draw a card.)";
const CYCLE_TEXT = "When you cycle this card, destroy up to one target artifact or enchantment with mana value X.";

export default defineCard({
  name: "Webstrike Elite",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Archer"],
  power: 3,
  toughness: 3,
  keywords: ["reach"],
  cycling: { cost: "{X}{G}{G}" },
  text: `Reach\n${CYCLING_TEXT}\n${CYCLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "permanent",
            filter: {
              typesAnyOf: ["artifact", "enchantment"],
              manaValue: { op: "eq", n: { amount: { triggerValue: true } } },
            },
          },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
