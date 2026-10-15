import { defineCard } from "../define.js";

// EDHREC rank 12531. The creature count is read as the spell resolves.

const BIG = { ifCondition: { kind: "controls", filter: { type: "creature" }, atLeast: 3 }, then: 4, else: 2 } as const;

export default defineCard({
  name: "You're Not Alone",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. If you control three or more creatures, it gets +4/+4 until end of turn instead.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: BIG, toughness: BIG, duration: "end-of-turn" },
});
