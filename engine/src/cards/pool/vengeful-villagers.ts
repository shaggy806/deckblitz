import { defineCard } from "../define.js";

// EDHREC rank 24141.
//
// The target is tapped first, then the sacrifice is offered (High-Society
// Hunter's shape — "an artifact or creature", so the Villagers itself may
// be the one); the stun counter goes on the chosen creature only if a
// permanent was sacrificed.

const ATTACK_TEXT =
  "Whenever this creature attacks, choose target creature an opponent controls. Tap it, then you may sacrifice an artifact or creature. If you do, put a stun counter on the chosen creature.";

export default defineCard({
  name: "Vengeful Villagers",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 3,
  toughness: 3,
  text: `${ATTACK_TEXT} (If a permanent with a stun counter would become untapped, remove one from it instead.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          {
            kind: "each-player-may",
            who: "you",
            options: [{ sacrifice: { typesAnyOf: ["artifact", "creature"] }, text: "Sacrifice an artifact or creature" }],
            ifDid: { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
