import { defineCard } from "../define.js";

// EDHREC rank 18370. Streets of New Capenna. You're Not Alone at four
// creatures, counted as it resolves.
const BIG = { ifCondition: { kind: "controls", filter: { type: "creature" }, atLeast: 4 }, then: 4, else: 2 } as const;

export default defineCard({
  name: "For the Family",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. If you control four or more creatures, that creature gets +4/+4 until end of turn instead.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: BIG, toughness: BIG, duration: "end-of-turn" },
});
