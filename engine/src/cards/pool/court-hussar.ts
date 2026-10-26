import { defineCard } from "../define.js";

// Dissension. "Unless {W} was spent to cast it" reads the mana spent on the
// spell it entered as; one that entered without being cast matches nothing,
// so it's sacrificed (the ruling).
const LOOK =
  "When this creature enters, look at the top three cards of your library, then put one of them into your hand and the rest on the bottom of your library in any order.";
const SAC = "When this creature enters, sacrifice it unless {W} was spent to cast it.";

export default defineCard({
  name: "Court Hussar",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Knight"],
  power: 1,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${LOOK}\n${SAC}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: LOOK,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "source", filter: { manaSpentOfColors: { W: 1 } } } },
        then: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: SAC,
    },
  ],
});
