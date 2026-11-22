import { defineCard } from "../define.js";

// "Can't become untapped" stops every untap, not only the untap step's
// (Blossombind's act), bound to the creature as it is now (rule 400.7) and
// lasting for as long as its controller controls Spider-Woman.

const ETB =
  "When Spider-Woman enters, tap target creature an opponent controls. That creature can't become untapped for as long as you control Spider-Woman.";

export default defineCard({
  name: "Spider-Woman, Secret Agent",
  manaCost: "{3}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Spider", "Human", "Spy", "Hero"],
  power: 1,
  toughness: 4,
  keywords: ["flash"],
  text: `Flash\n${ETB}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "prohibit", prohibits: [{ act: "untap", target: 0 }], duration: "while-you-control-source" },
        ],
      },
      resolve: null,
      text: ETB,
    },
  ],
});
