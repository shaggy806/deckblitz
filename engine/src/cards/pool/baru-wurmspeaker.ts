import { defineCard } from "../define.js";

// Rulings:
//   [2022-09-09] The cost reduction of Baru’s last ability can’t reduce the cost to activate it to
//     less than {G}, even if you control a Wurm with power greater than 7.
// (The reduction takes off generic mana only, so {G} always remains.)

export default defineCard({
  name: "Baru, Wurmspeaker",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 3,
  toughness: 3,
  text: "Wurms you control get +2/+2 and have trample.\n{7}{G}, {T}: Create a 4/4 green Wurm creature token. This ability costs {X} less to activate, where X is the greatest power among Wurms you control.",
  activated: [
    {
      cost: { mana: "{7}{G}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Wurm Token (Baru, Wurmspeaker)", count: 1 },
      resolve: null,
      costReduction: {
        reduceGeneric: {
          aggregate: "max",
          of: "power",
          filter: { type: "creature", subtype: "Wurm", controlledBy: "you" },
        },
      },
      text: "{7}{G}, {T}: Create a 4/4 green Wurm creature token. This ability costs {X} less to activate, where X is the greatest power among Wurms you control.",
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Wurm" },
      grantPt: [2, 2],
      grantKeywords: ["trample"],
      text: "Wurms you control get +2/+2 and have trample.",
    },
  ],
});
