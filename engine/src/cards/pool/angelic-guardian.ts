import { defineCard } from "../define.js";

// EDHREC rank 12555.

export default defineCard({
  name: "Angelic Guardian",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying (This creature can't be blocked except by creatures with flying or reach.)\nWhenever one or more creatures you control attack, they gain indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy them.)",
  triggered: [
    {
      trigger: { on: "attacks-batch", who: "you" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { inSet: "trigger-batch" },
        keyword: "indestructible",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever one or more creatures you control attack, they gain indestructible until end of turn.",
    },
  ],
});
