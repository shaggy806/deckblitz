import { defineCard } from "../define.js";

export default defineCard({
  name: "Necrobite",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gains deathtouch until end of turn. Regenerate it. (The next time that creature would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
      { kind: "regenerate", target: 0 },
    ],
  },
});
