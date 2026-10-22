import { defineCard } from "../define.js";

const TEXT = "{T}, Sacrifice another Orc or Goblin: Other Orc creatures get +1/+1 until end of turn.";

export default defineCard({
  name: "Orc General",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { subtypes: ["Orc", "Goblin"] } } },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Orc" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
