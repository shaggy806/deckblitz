import { defineCard } from "../define.js";

const TEXT = "Whenever you cast a Treefolk spell, you may have target creature get +3/-3 until end of turn.";

export default defineCard({
  name: "Thorntooth Witch",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Treefolk", "Shaman"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtype: "Treefolk" } },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have the target creature get +3/-3 until end of turn?",
        effect: { kind: "modify-pt", target: 0, power: 3, toughness: -3, duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
