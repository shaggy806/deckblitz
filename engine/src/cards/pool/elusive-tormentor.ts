import { defineCard } from "../define.js";

const TEXT = "{1}, Discard a card: Transform this creature.";

// Its ruling: activated several times, only the first to resolve transforms
// it — an ability transforms its permanent only if it hasn't transformed
// since the ability was put on the stack (rule 701.28f).
export default defineCard({
  name: "Elusive Tormentor",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Wizard"],
  power: 4,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Elusive Tormentor", "Insidious Mist"],
  transform: true,
});
