import { defineCard } from "../define.js";

export default defineCard({
  name: "Weathered Runestone",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "Nonland permanent cards in graveyards and libraries can't enter the battlefield.\nPlayers can't cast spells from graveyards or libraries.",
  static: [
    { affects: { scope: "self" }, prohibits: [{ act: "enter", object: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"], notTypes: ["land"], anyOf: [{ inZone: "graveyard" }, { inZone: "library" }] } }], text: "Nonland permanent cards in graveyards and libraries can't enter the battlefield." },
    { affects: { scope: "self" }, prohibits: [{ act: "cast", who: "each-player", from: ["graveyard", "library"] }], text: "Players can't cast spells from graveyards or libraries." },
  ],
});
