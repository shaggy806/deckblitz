import { defineCard } from "../define.js";

// EDHREC rank 17518.
//
// Rulings:
//   You choose Frog or Octopus as Mercurial Transformation resolves, not when you cast it.

export default defineCard({
  name: "Mercurial Transformation",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "Until end of turn, target nonland permanent loses all abilities and becomes your choice of a blue Frog creature with base power and toughness 1/1 or a blue Octopus creature with base power and toughness 4/4.",
  targets: ["nonland-permanent"],
  // "Becomes a … creature" with no "in addition": creature replaces its other
  // card types and Frog/Octopus its subtypes (rule 205.1a); supertypes stay.
  // The choice is made on resolution (the ruling), so it's a resolution-time
  // modal over the spell's one target.
  effect: {
    kind: "modal",
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "A blue Frog creature with base power and toughness 1/1",
        effect: {
          kind: "animate",
          target: 0,
          power: 1,
          toughness: 1,
          setTypes: ["creature"],
          addTypes: [],
          addSubtypes: [],
          setSubtypes: ["Frog"],
          setColors: ["U"],
          loseAbilities: true,
          duration: "end-of-turn",
        },
      },
      {
        text: "A blue Octopus creature with base power and toughness 4/4",
        effect: {
          kind: "animate",
          target: 0,
          power: 4,
          toughness: 4,
          setTypes: ["creature"],
          addTypes: [],
          addSubtypes: [],
          setSubtypes: ["Octopus"],
          setColors: ["U"],
          loseAbilities: true,
          duration: "end-of-turn",
        },
      },
    ],
  },
});
