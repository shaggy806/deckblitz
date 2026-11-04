import { defineCard } from "../define.js";

export default defineCard({
  name: "Hezrou",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Frog", "Demon"],
  power: 6,
  toughness: 6,
  text: "Whenever one or more creatures you control become blocked, each blocking creature gets -1/-1 until end of turn.",
  triggered: [
    {
      trigger: { on: "become-blocked-batch", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", blocking: true },
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever one or more creatures you control become blocked, each blocking creature gets -1/-1 until end of turn.",
    },
  ],
  faces: ["Hezrou", "Demonic Stench"],
  adventure: true,
});
