import { defineCard } from "../define.js";

export default defineCard({
  name: "Jolrael's Centaur",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Archer"],
  power: 2,
  toughness: 2,
  keywords: ["shroud", "flanking"],
  text: "Shroud (This creature can't be the target of spells or abilities.)\nFlanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)",
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
