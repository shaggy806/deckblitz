import { defineCard } from "../define.js";

// EDHREC rank 3907.
//
// "If {S} was spent to cast this spell" — any mana from a snow source spent
// on it (rule 107.4h), which the permanent remembers from its spell
// (`manaFrom`). Cast without snow mana it still taps the target.
const ENTER_TEXT =
  "When this creature enters, tap target artifact or creature an opponent controls. If {S} was spent to cast this spell, that permanent doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Berg Strider",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Giant", "Wizard"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT} ({S} is mana from a snow source.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { manaFrom: { supertype: "snow" } } },
        then: { kind: "tap", target: 0, doesntUntapNext: true },
        else: { kind: "tap", target: 0 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
