import { defineCard } from "../define.js";

const SCRY = "Whenever one or more permanents you control leave the battlefield, scry 1.";

export default defineCard({
  name: "Nefarious Imp",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${SCRY} (Look at the top card of your library. You may put that card on the bottom.)`,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "you-control", batched: true },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: SCRY,
    },
  ],
});
