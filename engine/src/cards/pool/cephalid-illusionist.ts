import { defineCard } from "../define.js";

const MILL_TEXT = "Whenever this creature becomes the target of a spell or ability, mill three cards.";
const FOG_TEXT = "{2}{U}, {T}: Prevent all combat damage that would be dealt to and dealt by target creature you control this turn.";

export default defineCard({
  name: "Cephalid Illusionist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus", "Wizard"],
  power: 1,
  toughness: 1,
  text: `${MILL_TEXT}\n${FOG_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 3 },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{U}", tap: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage-rule", to: { target: 0 }, combat: true },
          { kind: "damage-rule", by: { target: 0 }, combat: true },
        ],
      },
      resolve: null,
      text: FOG_TEXT,
    },
  ],
});
