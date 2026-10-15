import { defineCard } from "../define.js";

// EDHREC rank 23332.
// Makes Mutagen → use "Mutagen Token".

export default defineCard({
  name: "Zoo Escapees",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Boar", "Rhino"],
  power: 2,
  toughness: 2,
  text: "When this creature leaves the battlefield, create a Mutagen token. (It's an artifact with \"{1}, {T}, Sacrifice this token: Put a +1/+1 counter on target creature. Activate only as a sorcery.\")",
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mutagen Token", count: 1 },
      resolve: null,
      text: "When this creature leaves the battlefield, create a Mutagen token.",
    },
  ],
});
