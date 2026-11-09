import { defineCard } from "../define.js";

export default defineCard({
  name: "Dosan the Falling Leaf",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 2,
  toughness: 2,
  text: "Players can cast spells only during their own turns.",
  static: [{ affects: { scope: "self" }, prohibits: [{ act: "cast", who: "each-player", unless: "own-turn" }], text: "Players can cast spells only during their own turns." }],
});
