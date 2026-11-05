import { defineCard } from "../define.js";

// EDHREC rank 13471.
// Makes Mutagen → use "Mutagen Token".

export default defineCard({
  name: "Mona Lisa, Ever Adaptable",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Lizard", "Mutant"],
  power: 4,
  toughness: 4,
  text: "Whenever a player casts a creature spell, you create a Mutagen token. (It's an artifact with \"{1}, {T}, Sacrifice this token: Put a +1/+1 counter on target creature. Activate only as a sorcery.\")",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "create-token", token: "Mutagen Token", count: 1 },
      resolve: null,
      text: "Whenever a player casts a creature spell, you create a Mutagen token.",
    },
  ],
});
