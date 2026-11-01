import { defineCard } from "../define.js";

// Rule 702.16a: a creature type names permanents with it and sources elsewhere of
// it. Rule 702.16g: "and from" is two protections, one quality each.

export default defineCard({
  name: "Baneslayer Angel",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "first-strike", "lifelink"],
  text: "Flying, first strike, lifelink, protection from Demons and from Dragons",
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { anyOf: [{ subtype: "Demon" }, { subtype: "Dragon" }] } },
      text: "Protection from Demons and from Dragons",
    },
  ],
});
