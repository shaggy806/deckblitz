import { defineCard } from "../define.js";

// EDHREC rank 13418.

export default defineCard({
  name: "Maul Splicer",
  manaCost: "{6}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Human", "Artificer"],
  power: 1,
  toughness: 1,
  text: "When this creature enters, create two 3/3 colorless Phyrexian Golem artifact creature tokens.\nGolem creatures you control have trample.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Golem Token", count: 2 },
      resolve: null,
      text: "When this creature enters, create two 3/3 colorless Phyrexian Golem artifact creature tokens.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Golem", controlledBy: "you" } },
      grantKeywords: ["trample"],
      text: "Golem creatures you control have trample.",
    },
  ],
});
