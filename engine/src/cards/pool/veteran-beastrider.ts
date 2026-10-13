import { defineCard } from "../define.js";

// EDHREC rank 9592.

export default defineCard({
  name: "Veteran Beastrider",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 4,
  text: "At the beginning of your end step, untap each creature you control.\n{2}{G}{W}: Creatures you control get +1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: "{2}{G}{W}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{2}{G}{W}: Creatures you control get +1/+1 until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
      resolve: null,
      text: "At the beginning of your end step, untap each creature you control.",
    },
  ],
});
