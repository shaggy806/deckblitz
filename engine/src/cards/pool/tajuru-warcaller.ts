import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 15004. Rally — Ondu Cleric's `thisOrAnother` pair.
const TEXT =
  "Rally — Whenever this creature or another Ally you control enters, creatures you control get +2/+2 until end of turn.";

export default defineCard({
  name: "Tajuru Warcaller",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior", "Ally"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 2,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
