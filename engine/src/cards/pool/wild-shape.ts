import { defineCard } from "../define.js";

// EDHREC rank 15601. The mode and the target are both chosen as it's cast (its ruling); the
// creature loses its other creature types but keeps its abilities, and the base P/T is set in
// timestamp order, under counters and other modifications (its other ruling, rule 613.4b).
export default defineCard({
  name: "Wild Shape",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose one. Until end of turn, target creature you control has that base power and toughness, becomes that creature type, and gains that ability.\n• 1/3 Turtle with hexproof.\n• 1/5 Spider with reach.\n• 3/3 Elephant with trample.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "1/3 Turtle with hexproof.",
        targets: ["creature-you-control"],
        effect: {
          kind: "animate",
          target: 0,
          power: 1,
          toughness: 3,
          addTypes: [],
          addSubtypes: [],
          setSubtypes: ["Turtle"],
          keywords: ["hexproof"],
          duration: "end-of-turn",
        },
      },
      {
        text: "1/5 Spider with reach.",
        targets: ["creature-you-control"],
        effect: {
          kind: "animate",
          target: 0,
          power: 1,
          toughness: 5,
          addTypes: [],
          addSubtypes: [],
          setSubtypes: ["Spider"],
          keywords: ["reach"],
          duration: "end-of-turn",
        },
      },
      {
        text: "3/3 Elephant with trample.",
        targets: ["creature-you-control"],
        effect: {
          kind: "animate",
          target: 0,
          power: 3,
          toughness: 3,
          addTypes: [],
          addSubtypes: [],
          setSubtypes: ["Elephant"],
          keywords: ["trample"],
          duration: "end-of-turn",
        },
      },
    ],
  },
});
