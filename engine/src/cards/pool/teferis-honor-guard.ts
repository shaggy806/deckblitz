import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 30591. Flanking is Mtenda Herder's trigger; the
// phase-out is Mist Dragon's.

export default defineCard({
  name: "Teferi's Honor Guard",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flanking"],
  text: "Flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)\n{U}{U}: This creature phases out. (While it's phased out, it's treated as though it doesn't exist. It phases in before you untap during your next untap step.)",
  activated: [
    {
      cost: { mana: "{U}{U}", tap: false },
      targets: [],
      effect: { kind: "phase-out", target: "source" },
      resolve: null,
      text: "{U}{U}: This creature phases out.",
    },
  ],
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self", blocker: { notKeyword: "flanking" } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Flanking",
    },
  ],
});
