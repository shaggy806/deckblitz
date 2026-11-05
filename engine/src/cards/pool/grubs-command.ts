import { defineCard } from "../define.js";

// EDHREC rank 12270.
//
// The fourth mode is the target player's own: they mill, and every Goblin card
// that mill put into their graveyard goes to their hand, nobody choosing.

export default defineCard({
  name: "Grub's Command",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["kindred", "sorcery"],
  subtypes: ["Goblin"],
  text: "Choose two —\n• Create a token that's a copy of target Goblin you control.\n• Creatures target player controls get +1/+1 and gain haste until end of turn.\n• Destroy target artifact or creature.\n• Target player mills five cards, then puts each Goblin card milled this way into their hand.",
  targets: [],
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: "Create a token that's a copy of target Goblin you control.",
        targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Goblin" } }],
        effect: { kind: "create-token-copy", of: 0, count: 1 },
      },
      {
        text: "Creatures target player controls get +1/+1 and gain haste until end of turn.",
        targets: ["player"],
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "modify-pt-all",
              filter: { type: "creature", controlledBy: "you" },
              controlledByTarget: 0,
              power: 1,
              toughness: 1,
              duration: "end-of-turn",
            },
            {
              kind: "grant-keyword-all",
              filter: { type: "creature", controlledBy: "you" },
              controlledByTarget: 0,
              keyword: "haste",
              duration: "end-of-turn",
            },
          ],
        },
      },
      { text: "Destroy target artifact or creature.", targets: ["artifact-or-creature"], effect: { kind: "destroy", target: 0 } },
      {
        text: "Target player mills five cards, then puts each Goblin card milled this way into their hand.",
        targets: ["player"],
        effect: {
          kind: "as-player",
          who: { target: 0 },
          effect: {
            kind: "sequence",
            effects: [
              { kind: "mill", target: "you", amount: 5 },
              {
                kind: "return-from-graveyard",
                filter: { subtype: "Goblin", thisWay: "milled" },
                destination: "hand",
                count: "all",
              },
            ],
          },
        },
      },
    ],
  },
});
