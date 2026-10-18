import { defineCard } from "../define.js";

// EDHREC rank 18050.
// Makes Elemental → use "Elemental Token (Prismari Pianist)".
//
// Rulings:
//   [2023-04-14] Joyful Stormsculptor’s last ability will trigger whether you tapped any creatures
//     to pay for the spell or not, as long as it has convoke.

export default defineCard({
  name: "Joyful Stormsculptor",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 3,
  text: "When this creature enters, create two 1/1 blue and red Elemental creature tokens.\nWhenever you cast a spell that has convoke, this creature deals 1 damage to each opponent and each battle they protect.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Elemental Token (Prismari Pianist)", count: 2 },
      resolve: null,
      text: "When this creature enters, create two 1/1 blue and red Elemental creature tokens.",
    },
    {
      // A spell that has convoke, whether or not anything convoked it (the
      // ruling).
      trigger: { on: "cast-spell", who: "you", filter: { hasConvoke: true } },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 1, who: "each-opponent" },
          { kind: "damage-all", amount: 1, filter: { type: "battle", protectedBy: "opponent" } },
        ],
      },
      resolve: null,
      text: "Whenever you cast a spell that has convoke, this creature deals 1 damage to each opponent and each battle they protect.",
    },
  ],
});
