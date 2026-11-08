import { defineCard } from "../define.js";

const TEXT =
  "{T}: Return another target permanent you control and all Auras you control attached to it to their owner's hand. Activate only during your turn.";

export default defineCard({
  name: "Essence Reliquary",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      condition: { kind: "your-turn" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: {} } }],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand-all", filter: { subtype: "Aura", controlledBy: "you", attachedToObject: 0 } },
          { kind: "return-to-hand", target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
