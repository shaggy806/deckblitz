import { defineCard } from "../define.js";

// Rulings:
//   [2011-06-01] Only creatures you control on the battlefield when Arm with Aether resolves gain
//     the ability.
//   [2011-06-01] The granted ability triggers on all damage dealt by the creature to one of your
//     opponents, not just combat damage.
//   [2011-06-01] The affected creatures keep the ability even if another player gains control of
//     them that turn. If such a creature deals damage to you, the ability will trigger, targeting a
//     creature you control.
//   [2011-06-01] In a multiplayer game, if an affected creature deals damage to two of your
//     opponents simultaneously, the ability will trigger twice.
//
// The grant fixes its creatures as it resolves (rule 611.2c). "An opponent"
// is relative to the creature's controller, and the trigger fires once per
// recipient; "that player" is the `"trigger-player"`.

const GRANTED = "Whenever this creature deals damage to an opponent, you may return target creature that player controls to its owner's hand.";

export default defineCard({
  name: "Arm with Aether",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: `Until end of turn, creatures you control gain "${GRANTED}"`,
  targets: [],
  effect: {
    kind: "grant-triggered-all",
    filter: { type: "creature", controlledBy: "you" },
    duration: "end-of-turn",
    ability: {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Return target creature to its owner's hand?",
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: GRANTED,
    },
  },
});
