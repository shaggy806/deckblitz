import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 30078. Raging Spirit's colorless ability.

export default defineCard({
  name: "Blazing Blade Askari",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flanking"],
  text: "Flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)\n{2}: This creature becomes colorless until end of turn.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "become-color", target: "source", colors: [], duration: "end-of-turn" },
      resolve: null,
      text: "{2}: This creature becomes colorless until end of turn.",
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
