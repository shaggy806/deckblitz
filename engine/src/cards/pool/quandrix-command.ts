import { defineCard } from "../define.js";

// EDHREC rank 4370.

export default defineCard({
  name: "Quandrix Command",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["instant"],
  text: "Choose two —\n• Return target creature or planeswalker to its owner's hand.\n• Counter target artifact or enchantment spell.\n• Put two +1/+1 counters on target creature.\n• Target player shuffles up to three target cards from their graveyard into their library.",
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: "Return target creature or planeswalker to its owner's hand.",
        targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
        effect: { kind: "return-to-hand", target: 0 },
      },
      {
        text: "Counter target artifact or enchantment spell.",
        targets: [{ kind: "spell", filter: { typesAnyOf: ["artifact", "enchantment"] } }],
        effect: { kind: "counter", target: 0 },
      },
      {
        text: "Put two +1/+1 counters on target creature.",
        targets: ["creature"],
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      },
      {
        // The player gone illegal shuffles nothing; illegal cards alone, the player still shuffles
        // (the rulings).
        text: "Target player shuffles up to three target cards from their graveyard into their library.",
        targets: [
          "player",
          { kind: "any-number", of: { kind: "card-in-graveyard" }, max: 3, sameController: { slot: 0 } },
        ],
        effect: {
          kind: "conditional",
          condition: { kind: "target-legal", index: 0 },
          then: {
            kind: "sequence",
            effects: [
              {
                kind: "for-each-target",
                from: 1,
                simultaneous: true,
                effect: { kind: "put-on-library", target: 1, position: "top" },
              },
              { kind: "shuffle-library", target: 0 },
            ],
          },
        },
      },
    ],
  },
});
