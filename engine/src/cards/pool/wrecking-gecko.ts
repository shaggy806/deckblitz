import { defineCard } from "../define.js";

export default defineCard({
  name: "Wrecking Gecko",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["artifact", "creature"],
  subtypes: ["Lizard", "Construct"],
  power: 5,
  toughness: 5,
  text: "Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\n{6}{G}{G}: This creature gets +4/+4 and gains trample until end of turn.",
  activated: [
    {
      cost: { mana: "{6}{G}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 4,
            toughness: 4,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword",
            target: "source",
            keyword: "trample",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "{6}{G}{G}: This creature gets +4/+4 and gains trample until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
  ],
});
