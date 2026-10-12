import { defineCard } from "../define.js";

export default defineCard({
  name: "Viscerid Deepwalker",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homarid", "Warrior"],
  power: 2,
  toughness: 3,
  suspend: { n: 4, cost: "{U}" },
  text: "{U}: This creature gets +1/+0 until end of turn.\nSuspend 4—{U} (Rather than cast this card from your hand, you may pay {U} and exile it with four time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)",
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{U}: This creature gets +1/+0 until end of turn.",
    },
  ],
});
