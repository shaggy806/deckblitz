import { defineCard } from "../define.js";

export default defineCard({
  name: "Zhalfirin Lancer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  text: "Whenever another Knight you control enters, this creature gets +1/+1 and gains vigilance until end of turn.",
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { subtype: "Knight" },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 1,
            toughness: 1,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword",
            target: "source",
            keyword: "vigilance",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "Whenever another Knight you control enters, this creature gets +1/+1 and gains vigilance until end of turn.",
    },
  ],
});
