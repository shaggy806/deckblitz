import { defineCard } from "../define.js";

export default defineCard({
  name: "Regenerate",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Regenerate target creature. (The next time that creature would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)",
  targets: ["creature"],
  effect: { kind: "regenerate", target: 0 },
});
