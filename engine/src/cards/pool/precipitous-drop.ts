import { defineCard } from "../define.js";

// EDHREC rank 15803.
//
// The Aura's controller ventures, and it's whether *they* have completed a
// dungeon that decides -2/-2 or -5/-5 (the rulings) — a static's condition is
// read from its source's controller. The two statics are each other's
// complement, so exactly one applies at a time; completing a dungeon needn't
// happen while the Aura is out (the ruling) — the condition is a fact of the
// game, not of the Aura.
const PT_TEXT = "Enchanted creature gets -2/-2. It gets -5/-5 instead as long as you've completed a dungeon.";

export default defineCard({
  name: "Precipitous Drop",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nWhen this Aura enters, venture into the dungeon. (Enter the first room or advance to the next room.)\n${PT_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: "When this Aura enters, venture into the dungeon.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "not", of: { kind: "completed-dungeon" } },
      grantPt: [-2, -2],
      text: PT_TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "completed-dungeon" },
      grantPt: [-5, -5],
      text: PT_TEXT,
    },
  ],
});
