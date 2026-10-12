import { defineCard } from "../define.js";

export default defineCard({
  name: "Yellowjacket, Heartless Marauder",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Villain"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhenever another Villain you control enters, Yellowjacket gets +1/+0 and gains lifelink until end of turn.",
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { subtype: "Villain" },
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
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword",
            target: "source",
            keyword: "lifelink",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "Whenever another Villain you control enters, Yellowjacket gets +1/+0 and gains lifelink until end of turn.",
    },
  ],
});
