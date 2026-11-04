import { defineCard } from "../define.js";

// Which creature gets the counter isn't chosen until it's resolving (the ruling),
// and only among the targets still legal.
export default defineCard({
  name: "Aerith Rescue Mission",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text:
    "Choose one —\n" +
    "• Take the Elevator — Create three 1/1 colorless Hero creature tokens.\n" +
    "• Take 59 Flights of Stairs — Tap up to three target creatures. Put a stun counter on one of them. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Take the Elevator — Create three 1/1 colorless Hero creature tokens.",
        effect: { kind: "create-token", token: "Hero Token (Black Mage's Rod)", count: 3 },
      },
      {
        text: "Take 59 Flights of Stairs — Tap up to three target creatures. Put a stun counter on one of them.",
        targets: [{ kind: "any-number", of: "creature", max: 3 }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "tap", target: 0 } },
            {
              kind: "choose-among-targets",
              chooser: "you",
              count: 1,
              prompt: "Put a stun counter on one of them",
              chosen: { effect: { kind: "add-counter", target: 0, counter: "stun", amount: 1 } },
            },
          ],
        },
      },
    ],
  },
});
