import { defineCard } from "../define.js";

export default defineCard({
  name: "Suq'Ata Lancer",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["haste", "flanking"],
  text: "Haste\nFlanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)",
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
