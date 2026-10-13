import { defineCard } from "../define.js";

// EDHREC rank 3438.

export default defineCard({
  name: "Nylea, God of the Hunt",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 6,
  toughness: 6,
  keywords: ["indestructible"],
  text: "Indestructible\nAs long as your devotion to green is less than five, Nylea isn't a creature. (Each {G} in the mana costs of permanents you control counts toward your devotion to green.)\nOther creatures you control have trample.\n{3}{G}: Target creature gets +2/+2 until end of turn.",
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{3}{G}: Target creature gets +2/+2 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["G"], atMost: 4 },
      removeTypes: ["creature"],
      text: "As long as your devotion to green is less than five, Nylea isn't a creature.",
    },
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      grantKeywords: ["trample"],
      text: "Other creatures you control have trample.",
    },
  ],
});
