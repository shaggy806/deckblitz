import { defineCard } from "../define.js";

const VIGILANCE_TEXT = "Land creatures you control have vigilance.";
const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, you may have target land you control become a 3/3 Elemental creature with haste until end of turn. It's still a land.";

export default defineCard({
  name: "Embodiment of Insight",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${VIGILANCE_TEXT}\n${LANDFALL_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["land", "creature"], controlledBy: "you" } },
      grantKeywords: ["vigilance"],
      text: VIGILANCE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: ["land-you-control"],
      effect: {
        kind: "may",
        prompt: "Have the target land become a 3/3 Elemental creature with haste until end of turn?",
        effect: {
          kind: "animate",
          target: 0,
          power: 3,
          toughness: 3,
          addTypes: ["creature"],
          addSubtypes: ["Elemental"],
          keywords: ["haste"],
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
