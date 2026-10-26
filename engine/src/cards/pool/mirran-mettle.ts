import { defineCard } from "../define.js";

// EDHREC rank 28411. Metalcraft is read as the spell resolves.
const BIG = { ifCondition: { kind: "metalcraft" }, then: 4, else: 2 } as const;

export default defineCard({
  name: "Mirran Mettle",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn.\nMetalcraft — That creature gets +4/+4 until end of turn instead if you control three or more artifacts.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: BIG, toughness: BIG, duration: "end-of-turn" },
});
