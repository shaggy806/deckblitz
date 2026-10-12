import { defineCard } from "../define.js";

export default defineCard({
  name: "Shadow Rider",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Knight"],
  power: 3,
  toughness: 3,
  keywords: ["flanking"],
  text: "Flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)",
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
