import { defineCard } from "../define.js";

// Not optional: with only your own Angels around, you target one of them
// (its ruling).

const TEXT = "When this creature enters, destroy target Angel.";

export default defineCard({
  name: "Halo Hunter",
  manaCost: "{2}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 3,
  keywords: ["intimidate"],
  text: `Intimidate (This creature can't be blocked except by artifact creatures and/or creatures that share a color with it.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "any", filter: { subtype: "Angel" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
