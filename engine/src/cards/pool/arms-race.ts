import { defineCard } from "../define.js";

// The Brothers' War. Sneak Attack's shape for an artifact card. The delayed
// sacrifice acts only on the same object, still controlled by you (the
// ruling: not one that left and came back).
const PUT_TEXT =
  "{3}{R}: You may put an artifact card from your hand onto the battlefield. That artifact gains haste. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Arms Race",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: PUT_TEXT,
  activated: [
    {
      cost: { mana: "{3}{R}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "artifact" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
            {
              kind: "delayed-trigger",
              at: "next-end-step",
              effect: { kind: "sacrifice-target", target: 0 },
              text: "Sacrifice the artifact Arms Race put onto the battlefield.",
            },
          ],
        },
      },
      resolve: null,
      text: PUT_TEXT,
    },
  ],
});
