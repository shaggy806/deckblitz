import { defineCard } from "../define.js";

// EDHREC rank 11628. X is read as the spell resolves and locked in (its
// ruling): a modify-pt's amount is evaluated once.

export default defineCard({
  name: "Aspect of Hydra",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +X/+X until end of turn, where X is your devotion to green. (Each {G} in the mana costs of permanents you control counts toward your devotion to green.)",
  targets: ["creature"],
  effect: {
    kind: "modify-pt",
    target: 0,
    power: { devotionTo: "G" },
    toughness: { devotionTo: "G" },
    duration: "end-of-turn",
  },
});
