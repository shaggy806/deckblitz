import { defineCard } from "../define.js";

export default defineCard({
  name: "Skulking Knight",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["flanking"],
  text: "Flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)\nWhen this creature becomes the target of a spell or ability, sacrifice it.",
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
    {
      trigger: { on: "becomes-target", who: "self" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When this creature becomes the target of a spell or ability, sacrifice it.",
    },
  ],
});
