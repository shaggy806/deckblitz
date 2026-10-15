import { defineCard } from "../define.js";

// EDHREC rank 19745.
// Makes Mutagen → use "Mutagen Token".

export default defineCard({
  name: "Crustacean Commando",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Crab", "Mutant", "Soldier"],
  power: 0,
  toughness: 3,
  text: "When this creature enters, create a Mutagen token. (It's an artifact with \"{1}, {T}, Sacrifice this token: Put a +1/+1 counter on target creature. Activate only as a sorcery.\")",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mutagen Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a Mutagen token.",
    },
  ],
});
