import { defineCard } from "../define.js";

export default defineCard({
  name: "Kamahl, Fist of Krosa",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 4,
  toughness: 3,
  text: "{G}: Target land becomes a 1/1 creature until end of turn. It's still a land.\n{2}{G}{G}{G}: Creatures you control get +3/+3 and gain trample until end of turn.",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: ["land"],
      effect: {
        kind: "animate",
        target: 0,
        power: 1,
        toughness: 1,
        addTypes: ["creature"],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{G}: Target land becomes a 1/1 creature until end of turn. It's still a land.",
    },
    {
      cost: { mana: "{2}{G}{G}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 3,
            toughness: 3,
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
      text: "{2}{G}{G}{G}: Creatures you control get +3/+3 and gain trample until end of turn.",
    },
  ],
});
