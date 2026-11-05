import { defineCard } from "../define.js";

// EDHREC rank 19039.
// Makes Jace → use "Jace Token".

export default defineCard({
  name: "Theorist's Proxy",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 0,
  toughness: 3,
  keywords: ["flash"],
  text: "Flash\nWhen this creature enters, empower Jace 3. (Put three loyalty counters on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")\n{U}, Sacrifice this creature: The next spell you cast this turn can't be countered.",
  activated: [
    {
      cost: { mana: "{U}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "grant-spells-this-turn", next: true, cantBeCountered: true },
      resolve: null,
      text: "{U}, Sacrifice this creature: The next spell you cast this turn can't be countered.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "empower-jace", amount: 3 },
      resolve: null,
      text: "When this creature enters, empower Jace 3.",
    },
  ],
});
