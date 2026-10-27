import { defineCard } from "../define.js";

const TEXT = "{W}: Prevent the next 1 damage that would be dealt to this creature this turn.";

export default defineCard({
  name: "Ordruun Commando",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Soldier"],
  power: 4,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "prevent-damage", target: "source", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
