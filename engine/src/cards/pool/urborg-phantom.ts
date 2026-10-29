import { defineCard } from "../define.js";

// EDHREC rank 32257.

export default defineCard({
  name: "Urborg Phantom",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit", "Minion"],
  power: 3,
  toughness: 1,
  text: "This creature can't block.\n{U}: Prevent all combat damage that would be dealt to and dealt by this creature this turn.",
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage-rule", to: { target: "source" }, combat: true },
          { kind: "damage-rule", by: { target: "source" }, combat: true },
        ],
      },
      resolve: null,
      text: "{U}: Prevent all combat damage that would be dealt to and dealt by this creature this turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
});
