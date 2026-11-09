import { defineCard } from "../define.js";

// EDHREC rank 27294.

export default defineCard({
  name: "Singing Tree",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant"],
  power: 0,
  toughness: 3,
  text: "{T}: Target attacking creature has base power 0 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: {
        kind: "become",
        target: 0,
        power: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{T}: Target attacking creature has base power 0 until end of turn.",
    },
  ],
});
