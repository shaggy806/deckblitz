import { defineCard } from "../define.js";

// EDHREC rank 3782.
//
// Compleated (rule 702.150a): two fewer loyalty counters for each {G/P}
// paid with life. The Horror's X is Nissa's loyalty as the ability resolves —
// as she last existed if she has left — set once (the rulings). The −7's
// bonus counts the Forests as it resolves and reaches only the creatures you
// control then (the rulings).

const FORESTS = { countOf: { subtype: "Forest", controlledBy: "you" } } as const;

export default defineCard({
  name: "Nissa, Ascended Animist",
  manaCost: "{3}{G}{G}{G/P}{G/P}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Nissa"],
  loyalty: 7,
  compleated: true,
  text: "Compleated ({G/P} can be paid with {G} or 2 life. For each {G/P} paid with life, this planeswalker enters with two fewer loyalty counters.)\n+1: Create an X/X green Phyrexian Horror creature token, where X is Nissa's loyalty.\n−1: Destroy target artifact or enchantment.\n−7: Until end of turn, creatures you control get +1/+1 for each Forest you control and gain trample.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Phyrexian Horror Token (Nissa, Ascended Animist)",
        count: 1,
        basePt: {
          power: { countersOn: "source", counter: "loyalty" },
          toughness: { countersOn: "source", counter: "loyalty" },
        },
      },
      resolve: null,
      text: "+1: Create an X/X green Phyrexian Horror creature token, where X is Nissa's loyalty.",
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: ["artifact-or-enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "−1: Destroy target artifact or enchantment.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: FORESTS,
            toughness: FORESTS,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "trample",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "−7: Until end of turn, creatures you control get +1/+1 for each Forest you control and gain trample.",
    },
  ],
});
