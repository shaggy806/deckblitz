import { defineCard } from "../define.js";

// Ravnica Allegiance. "Them" is the creatures you control as it resolves —
// the same set the pump just read; an untapped one still gets +1/+3 (the
// ruling).
const CREATURES = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Rally to Battle",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Creatures you control get +1/+3 until end of turn. Untap them.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: CREATURES, power: 1, toughness: 3, duration: "end-of-turn" },
      { kind: "untap-all", filter: CREATURES },
    ],
  },
});
