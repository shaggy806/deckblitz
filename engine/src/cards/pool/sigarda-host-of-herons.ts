import { defineCard } from "../define.js";

export default defineCard({
  name: "Sigarda, Host of Herons",
  manaCost: "{2}{G}{W}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "hexproof"],
  text: "Flying, hexproof\nSpells and abilities your opponents control can't cause you to sacrifice permanents.",
  static: [{ affects: { scope: "self" }, prohibits: [{ act: "be-caused", who: "you", what: "sacrifice" }], text: "Spells and abilities your opponents control can't cause you to sacrifice permanents." }],
});
