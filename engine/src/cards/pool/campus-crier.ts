import { defineCard } from "../define.js";

export default defineCard({
  name: "Campus Crier",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 3,
  toughness: 1,
  text: "{1}, Exile this card from your graveyard: Empower Jace 2. (Put two loyalty counters on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "empower-jace", amount: 2 },
      resolve: null,
      text: "{1}, Exile this card from your graveyard: Empower Jace 2.",
      zone: "graveyard",
    },
  ],
});
