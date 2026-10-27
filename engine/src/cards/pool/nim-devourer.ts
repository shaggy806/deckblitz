import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 26343. Necrosavant's upkeep self-return, with
// the sacrifice moved from the cost into the effect: "then sacrifice a
// creature" happens as it resolves, and may be Nim Devourer itself.

const PT_TEXT = "This creature gets +1/+0 for each artifact you control.";
const RETURN_TEXT =
  "{B}{B}: Return this card from your graveyard to the battlefield, then sacrifice a creature. Activate only during your upkeep.";

export default defineCard({
  name: "Nim Devourer",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 4,
  toughness: 1,
  text: `${PT_TEXT}\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "artifact", controlledBy: "you" }, pt: [1, 0] },
      text: PT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{B}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: "source" },
          { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
        ],
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
