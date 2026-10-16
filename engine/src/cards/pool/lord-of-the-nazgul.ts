import { defineCard } from "../define.js";

// "Wraiths you control have protection from Ring-bearers" (rule 702.16):
// from any player's Ring-bearer (`ringBearer: "any"`), Hungry Lynx's shape —
// this one included, a Wraith itself. A Ring-bearer is chosen as the Ring
// tempts its controller (rule 701.54a).
export default defineCard({
  name: "Lord of the Nazgûl",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Wraith", "Noble"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Wraith" },
      protection: { filter: { ringBearer: "any" } },
      text: "Wraiths you control have protection from Ring-bearers.",
    },
  ],
  text: "Flying\nWraiths you control have protection from Ring-bearers.\nWhenever you cast an instant or sorcery spell, create a 3/3 black Wraith creature token with menace. Then if you control nine or more Wraiths, Wraiths you control have base power and toughness 9/9 until end of turn.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Wraith Token", count: 1 },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { subtype: "Wraith" }, atLeast: 9 },
            then: {
              kind: "animate-all",
              filter: { subtype: "Wraith", controlledBy: "you" },
              power: 9,
              toughness: 9,
              duration: "end-of-turn",
            },
          },
        ],
      },
      resolve: null,
      text: "Whenever you cast an instant or sorcery spell, create a 3/3 black Wraith creature token with menace. Then if you control nine or more Wraiths, Wraiths you control have base power and toughness 9/9 until end of turn.",
    },
  ],
});
