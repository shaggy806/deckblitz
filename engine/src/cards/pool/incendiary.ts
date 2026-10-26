import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, you may put a fuse counter on this Aura.";
const DIES_TEXT =
  "When enchanted creature dies, this Aura deals X damage to any target, where X is the number of fuse counters on this Aura.";

export default defineCard({
  name: "Incendiary",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${UPKEEP_TEXT}\n${DIES_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a fuse counter on Incendiary?",
        effect: { kind: "add-counter", target: "source", counter: "fuse", amount: 1 },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      // The Aura is in the graveyard by the time this resolves: its fuse
      // counters are read as it last existed on the battlefield (608.2h).
      trigger: { on: "dies", who: "attached" },
      targets: ["any-target"],
      effect: { kind: "damage", target: 0, amount: { countersOn: "source", counter: "fuse" } },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
