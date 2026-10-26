import { defineCard } from "../define.js";

const TEXT = "Whenever this creature blocks a creature with flying, this creature gets +3/+0 until end of turn.";

// Netcaster Spider's trigger: once per flying creature blocked (the ruling).
export default defineCard({
  name: "Ezuri's Archers",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 1,
  toughness: 2,
  keywords: ["reach"],
  text: `Reach (This creature can block creatures with flying.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      whileCondition: { kind: "trigger-object", filter: { keyword: "flying" } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 3, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
