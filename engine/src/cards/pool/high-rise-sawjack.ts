import { defineCard } from "../define.js";

// Once for each creature with flying it blocks (rule 509.3b), that creature's
// flying read as the block is declared (509.3f): losing it later undoes nothing.
const TEXT = "Whenever this creature blocks a creature with flying, this creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "High-Rise Sawjack",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Citizen"],
  power: 2,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach (This creature can block creatures with flying.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      whileCondition: { kind: "trigger-object", filter: { keyword: "flying" } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
