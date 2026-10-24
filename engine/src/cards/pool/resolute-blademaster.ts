import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const TEXT =
  "Rally — Whenever this creature or another Ally you control enters, creatures you control gain double strike until end of turn.";

export default defineCard({
  name: "Resolute Blademaster",
  manaCost: "{3}{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Ally"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "double-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
