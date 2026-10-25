import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const TEXT =
  "Whenever this creature or another Ally you control enters, you may have Ally creatures you control gain first strike until end of turn.";

export default defineCard({
  name: "Highland Berserker",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Berserker", "Ally"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Ally creatures you control gain first strike until end of turn?",
        effect: {
          kind: "grant-keyword-all",
          filter: { type: "creature", subtype: "Ally", controlledBy: "you" },
          keyword: "first-strike",
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
