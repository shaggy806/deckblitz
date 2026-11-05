import { defineCard } from "../define.js";

// Equipment stays (the ruling).
const TEXT = "{1}, {T}: Return target creature you control and each Aura attached to it to their owners' hands. Activate only during your turn.";

export default defineCard({
  name: "Portal of Sanctuary",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      condition: { kind: "your-turn" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand-all", filter: { subtype: "Aura", attachedToTarget: 0 } },
          { kind: "return-to-hand", target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
