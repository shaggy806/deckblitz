import { defineCard } from "../define.js";

const ETB_TEXT = "When Llawan enters, return all blue creatures your opponents control to their owners' hands.";
const STATIC_TEXT = "Your opponents can't cast blue creature spells.";

export default defineCard({
  name: "Llawan, Cephalid Empress",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Octopus", "Noble"],
  power: 2,
  toughness: 3,
  text: `${ETB_TEXT}\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "return-to-hand-all",
        filter: { type: "creature", colors: ["U"], controlledBy: "opponent" },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "opponents", spells: { type: "creature", colors: ["U"] } },
      text: STATIC_TEXT,
    },
  ],
});
