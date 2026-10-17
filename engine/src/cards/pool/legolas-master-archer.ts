import { defineCard } from "../define.js";

// Rulings: a spell targeting Legolas and a creature you don't control fires
// both; the second fires once however many such creatures it targets; both
// resolve before the spell, even if it's countered.
const HEROIC_TEXT = "Whenever you cast a spell that targets Legolas, put a +1/+1 counter on Legolas.";
const ARROW_TEXT =
  "Whenever you cast a spell that targets a creature you don't control, Legolas deals damage equal to its power to up to one target creature.";

export default defineCard({
  name: "Legolas, Master Archer",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 1,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${HEROIC_TEXT}\n${ARROW_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: HEROIC_TEXT,
    },
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { targets: { permanent: { type: "creature", controlledBy: "opponent" } } },
      },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: ARROW_TEXT,
    },
  ],
});
