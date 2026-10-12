import { defineCard } from "../define.js";

export default defineCard({
  name: "Bone Flute",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}: All creatures get -1/-0 until end of turn.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: -1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{2}, {T}: All creatures get -1/-0 until end of turn.",
    },
  ],
});
