import { defineCard } from "../define.js";

// EDHREC rank 15790.
//
// The second mode doesn't target: the Cave is chosen as it resolves, and may be
// one the first mode just fetched (the rulings).

export default defineCard({
  name: "Cosmium Confluence",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Choose three. You may choose the same mode more than once.\n• Search your library for a Cave card, put it onto the battlefield tapped, then shuffle.\n• Put three +1/+1 counters on a Cave you control. It becomes a 0/0 Elemental creature with haste. It's still a land.\n• Destroy target enchantment.",
  targets: [],
  castModal: {
    minModes: 3,
    maxModes: 3,
    repeatModes: true,
    modes: [
      {
        text: "Search your library for a Cave card, put it onto the battlefield tapped, then shuffle.",
        effect: {
          kind: "search-library",
          filter: { subtype: "Cave" },
          destination: "battlefield",
          enterTapped: true,
          min: 0,
          max: 1,
        },
      },
      {
        text: "Put three +1/+1 counters on a Cave you control. It becomes a 0/0 Elemental creature with haste. It's still a land.",
        effect: {
          kind: "choose-permanents",
          filter: { subtype: "Cave", controlledBy: "you" },
          min: 1,
          upTo: 1,
          prompt: "Choose a Cave you control",
          then: {
            kind: "sequence",
            effects: [
              { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
              {
                kind: "animate",
                target: 0,
                power: 0,
                toughness: 0,
                addTypes: ["creature"],
                addSubtypes: ["Elemental"],
                keywords: ["haste"],
                duration: "permanent",
              },
            ],
          },
        },
      },
      { text: "Destroy target enchantment.", targets: ["enchantment"], effect: { kind: "destroy", target: 0 } },
    ],
  },
});
