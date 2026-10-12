import { defineCard } from "../define.js";

export default defineCard({
  name: "Cadaverous Knight",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flanking"],
  text: "Flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)\n{1}{B}{B}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{1}{B}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{B}{B}: Regenerate this creature.",
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
