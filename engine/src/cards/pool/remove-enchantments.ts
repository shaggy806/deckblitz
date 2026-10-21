import { defineCard } from "../define.js";

// EDHREC rank 25826. Two mass moves, each one event. Everything the first
// returns is owned by you, so its owner's hand is yours. "All other" in the
// second sentence is whatever matching the same three groups is still on the
// battlefield once the first has happened.

export default defineCard({
  name: "Remove Enchantments",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Return to your hand all enchantments you both own and control, all Auras you own attached to permanents you control, and all Auras you own attached to attacking creatures your opponents control. Then destroy all other enchantments you control, all other Auras attached to permanents you control, and all other Auras attached to attacking creatures your opponents control.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "return-to-hand-all",
        filter: {
          type: "enchantment",
          anyOf: [
            { ownedBy: "you", controlledBy: "you" },
            { subtype: "Aura", ownedBy: "you", attachedTo: { controlledBy: "you" } },
            {
              subtype: "Aura",
              ownedBy: "you",
              attachedTo: { type: "creature", attacking: true, controlledBy: "opponent" },
            },
          ],
        },
      },
      {
        kind: "destroy-all",
        filter: {
          type: "enchantment",
          anyOf: [
            { controlledBy: "you" },
            { subtype: "Aura", attachedTo: { controlledBy: "you" } },
            { subtype: "Aura", attachedTo: { type: "creature", attacking: true, controlledBy: "opponent" } },
          ],
        },
      },
    ],
  },
});
