import { defineCard } from "../define.js";

// Each foe, in turn, chooses one untapped creature they control (a vote of
// one, kept as "chosen"), then taps the rest of theirs.
export default defineCard({
  name: "Regna's Sanction",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text:
    "For each player, choose friend or foe. Each friend puts a +1/+1 counter on each creature they control. Each foe chooses one untapped creature they control, then taps the rest.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", choose: true, who: "you", for: { options: ["friend", "foe"], about: "each-player" } },
      {
        kind: "for-each-player",
        who: "each-friend",
        effect: {
          kind: "as-player",
          who: "that-player",
          effect: { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
        },
      },
      {
        kind: "for-each-player",
        who: "each-foe",
        effect: {
          kind: "as-player",
          who: "that-player",
          effect: {
            kind: "sequence",
            effects: [
              {
                kind: "vote",
                choose: true,
                who: "you",
                for: { permanent: { type: "creature", tapped: false, controlledBy: "you" }, own: true, keep: true },
              },
              { kind: "tap-all", filter: { type: "creature", controlledBy: "you", notThisWay: "chosen" } },
            ],
          },
        },
      },
    ],
  },
});
