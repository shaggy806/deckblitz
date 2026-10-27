import { defineCard } from "../define.js";

const TEXT = "Whenever Pianna attacks, attacking creatures get +1/+1 until end of turn.";

export default defineCard({
  name: "Pianna, Nomad Captain",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Nomad"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
