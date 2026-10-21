import { defineCard } from "../define.js";

// The attacker is targeted as the trigger goes on the stack and exiled only
// if its controller says so as it resolves; "if you do" is the `this-way`
// exile. The creature found attacks a player or planeswalker of its
// controller's choice and was never declared (the rulings; rule 508.4), so
// attack triggers don't see it. A library with no creature card goes to the
// bottom in a random order and nothing comes back (the ruling).
const ATTACK_TEXT =
  "Whenever this creature attacks, you may exile another target attacking creature you control. If you do, reveal cards from the top of your library until you reveal a creature card. Put that card onto the battlefield tapped and attacking and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Fireflux Squad",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "other",
          of: { kind: "permanent", filter: { type: "creature", controlledBy: "you", attacking: true } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Exile the target attacking creature?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: 0 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: {
                kind: "reveal-until",
                filter: { type: "creature" },
                put: "battlefield",
                tapped: true,
                attacking: "choose",
                rest: "bottom-random",
              },
            },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
