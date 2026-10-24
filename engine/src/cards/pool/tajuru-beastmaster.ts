import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 23110. Rally — Ondu Cleric's `thisOrAnother` pair.
const TEXT =
  "Rally — Whenever this creature or another Ally you control enters, creatures you control get +1/+1 until end of turn.";

export default defineCard({
  name: "Tajuru Beastmaster",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior", "Ally"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
