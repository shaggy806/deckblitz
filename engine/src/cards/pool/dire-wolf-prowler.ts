import { defineCard } from "../define.js";

export default defineCard({
  name: "Dire Wolf Prowler",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 2,
  text: "{1}{G}: This creature gets +2/+2 and gains haste until end of turn. Activate only once each turn.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 2,
            toughness: 2,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword",
            target: "source",
            keyword: "haste",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "{1}{G}: This creature gets +2/+2 and gains haste until end of turn. Activate only once each turn.",
      oncePerTurn: true,
    },
  ],
});
