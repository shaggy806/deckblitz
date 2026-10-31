import { defineCard } from "../define.js";

// The opponent the caster names chooses the mode as it's cast
// (`castModal.chosenBy`, rule 700.2e), and is "that player" of the second.
// The caster puts the counters either way.
export default defineCard({
  name: "Misfortune",
  manaCost: "{1}{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["sorcery"],
  text: "An opponent chooses one —\n• You put a +1/+1 counter on each creature you control and gain 4 life.\n• You put a -1/-1 counter on each creature that player controls and Misfortune deals 4 damage to that player.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    chosenBy: "opponent",
    modes: [
      {
        text: "You put a +1/+1 counter on each creature you control and gain 4 life.",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
            { kind: "gain-life", amount: 4 },
          ],
        },
      },
      {
        text: "You put a -1/-1 counter on each creature that player controls and Misfortune deals 4 damage to that player.",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "add-counter-all",
              filter: { type: "creature", controlledBy: "you" },
              controlledByPlayer: "that-player",
              counter: "-1/-1",
              amount: 1,
            },
            { kind: "damage", amount: 4, who: "that-player" },
          ],
        },
      },
    ],
  },
});
