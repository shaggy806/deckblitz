import { defineCard } from "../define.js";

// EDHREC rank 24055. Every Zombie on the battlefield counts, whoever
// controls it.

const MINUS_X = { product: [{ countOf: { subtype: "Zombie" } }, -1] } as const;

export default defineCard({
  name: "Feeding Frenzy",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -X/-X until end of turn, where X is the number of Zombies on the battlefield.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: MINUS_X, toughness: MINUS_X, duration: "end-of-turn" },
});
