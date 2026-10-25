import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const LIFE_TEXT = "Whenever this creature or another creature you control enters, you gain 1 life.";
const TRANSFORM_TEXT = "{2}, {T}, Sacrifice another permanent: Transform this creature.";

// Bogwater Lumaret's two triggers (the ruling: entering beside another
// creature triggers once for each).
export default defineCard({
  name: "Pious Evangel",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: `${LIFE_TEXT}\n${TRANSFORM_TEXT}`,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: LIFE_TEXT,
    }),
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: { filter: {} } },
      otherOnly: true,
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Pious Evangel", "Wayward Disciple"],
  transform: true,
});
