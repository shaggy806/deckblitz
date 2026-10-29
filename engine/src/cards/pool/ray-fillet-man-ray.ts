import { defineCard } from "../define.js";

// EDHREC rank 18358.
// Makes Mutagen → use "Mutagen Token".

export default defineCard({
  name: "Ray Fillet, Man Ray",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Fish", "Mutant"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen Ray Fillet enters, create a Mutagen token. (It's an artifact with \"{1}, {T}, Sacrifice this token: Put a +1/+1 counter on target creature. Activate only as a sorcery.\")\n{2}, Remove a +1/+1 counter from a creature you control: Draw a card.",
  activated: [
    {
      cost: {
        mana: "{2}",
        tap: false,
        removeCounter: { kind: "+1/+1", count: 1, from: { type: "creature" } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{2}, Remove a +1/+1 counter from a creature you control: Draw a card.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mutagen Token", count: 1 },
      resolve: null,
      text: "When Ray Fillet enters, create a Mutagen token.",
    },
  ],
});
