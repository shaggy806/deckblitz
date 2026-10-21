import { defineCard } from "../define.js";

// EDHREC rank 23714.
//
// Beat a Path's "can't block" over three distinct optional slots; the Walls
// among them are destroyed as one instruction (one event).

const isWall = (index: number) => ({ kind: "target", index, filter: { subtype: "Wall" } }) as const;

export default defineCard({
  name: "Blow Your House Down",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Up to three target creatures can't block this turn. Destroy any of them that are Walls.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0, 1] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      { kind: "restrict", target: 1, restrictions: ["cant-block"] },
      { kind: "restrict", target: 2, restrictions: ["cant-block"] },
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "conditional", condition: isWall(0), then: { kind: "destroy", target: 0 } },
          { kind: "conditional", condition: isWall(1), then: { kind: "destroy", target: 1 } },
          { kind: "conditional", condition: isWall(2), then: { kind: "destroy", target: 2 } },
        ],
      },
    ],
  },
});
