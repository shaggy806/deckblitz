import { defineCard } from "../define.js";

export default defineCard({
  name: "Spirit of the Night",
  manaCost: "{6}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon", "Spirit"],
  power: 6,
  toughness: 5,
  keywords: ["flying", "trample", "haste"],
  text: "Flying, trample, haste, protection from black\nSpirit of the Night has first strike as long as it's attacking.",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: true } },
      grantKeywords: ["first-strike"],
      text: "Spirit of the Night has first strike as long as it's attacking.",
    },
  ],
});
