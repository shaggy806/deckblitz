import { defineCard } from "../define.js";

export default defineCard({
  name: "Klothys's Design",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Creatures you control get +X/+X until end of turn, where X is your devotion to green. (Each {G} in the mana costs of permanents you control counts toward your devotion to green.)",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    power: { devotionTo: "G" },
    toughness: { devotionTo: "G" },
    duration: "end-of-turn",
  },
});
