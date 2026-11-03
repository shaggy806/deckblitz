import { defineCard } from "../define.js";

// "Can't have or gain" beats every timestamp, and a resolving effect that
// would give flying to an opponent's creature isn't created, so it doesn't
// come back if the Archetype leaves; a static grant does (the rulings).

const HAVE_TEXT = "Creatures you control have flying.";
const CANT_TEXT = "Creatures your opponents control lose flying and can't have or gain flying.";

export default defineCard({
  name: "Archetype of Imagination",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 2,
  text: `${HAVE_TEXT}\n${CANT_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantKeywords: ["flying"],
      text: HAVE_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } },
      cantHaveKeywords: ["flying"],
      text: CANT_TEXT,
    },
  ],
});
