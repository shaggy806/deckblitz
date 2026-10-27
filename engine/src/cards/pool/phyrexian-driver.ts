import { defineCard } from "../define.js";

// EDHREC rank 30347.

const TEXT = "When this creature enters, other Mercenary creatures get +1/+1 until end of turn.";

export default defineCard({
  name: "Phyrexian Driver",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie", "Mercenary"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Mercenary" },
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
