import { defineCard } from "../define.js";

// The creature's controller — the active player — decides whether to pay
// {X}; unpaid, it must attack this turn, and a delayed trigger destroys it at
// the next end step if it didn't.
const TEXT =
  "{3}, {T}: Choose target non-Wall creature the active player has controlled continuously since the beginning of the turn. That player may pay {X}, where X is that creature's mana value. If they don't pay, the creature attacks this turn if able, and at the beginning of the next end step, destroy it if it didn't attack this turn. Activate only before attackers are declared.";

export default defineCard({
  name: "Arcum's Whistle",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      condition: { kind: "before-attackers-declared" },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", notSubtypes: ["Wall"], controlledBy: "active-player", controlledSinceTurnBegan: true },
        },
      ],
      effect: {
        kind: "unless",
        chooser: { controllerOf: 0 },
        options: [{ payGeneric: { manaValueOf: 0 }, text: "Pay {X}, where X is that creature's mana value" }],
        otherwise: {
          kind: "sequence",
          effects: [
            { kind: "restrict", target: 0, restrictions: ["must-attack"], duration: "end-of-turn" },
            {
              kind: "delayed-trigger",
              at: { step: "end" },
              text: "Destroy it if it didn't attack this turn.",
              effect: {
                kind: "conditional",
                condition: { kind: "target", index: 0, filter: { attackedThisTurn: false } },
                then: { kind: "destroy", target: 0 },
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
