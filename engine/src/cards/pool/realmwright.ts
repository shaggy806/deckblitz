import { defineCard } from "../define.js";
import type { StaticAbility } from "../define.js";

// EDHREC rank 18837.
//
// Rulings:
//   [2013-01-24] Lands you control will have the ability to tap for the color of mana
//     corresponding to the chosen type. They'll also retain any other abilities they have.
//   [2013-01-24] The basic land types are Plains, Island, Swamp, Mountain, and Forest. Other land
//     types, like Gate, aren't basic lands types.
// The choice is a `chooseOnEnter` word (Shimmer's shape), one static per basic
// land type gated on it; a basic land type brings its intrinsic mana ability
// (rule 305.6).

const BASIC_LAND_TYPES = ["Plains", "Island", "Swamp", "Mountain", "Forest"] as const;

const STATIC_TEXT = "Lands you control are the chosen type in addition to their other types.";

const statics: StaticAbility[] = BASIC_LAND_TYPES.map((type) => ({
  affects: { scope: "filter", filter: { type: "land", controlledBy: "you" } },
  condition: { kind: "chosen-on-enter", value: type },
  addSubtypes: [type],
  text: STATIC_TEXT,
}));

export default defineCard({
  name: "Realmwright",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 1,
  toughness: 1,
  text: `As this creature enters, choose a basic land type.\n${STATIC_TEXT}`,
  chooseOnEnter: BASIC_LAND_TYPES,
  static: statics,
});
