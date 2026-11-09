import { defineCard } from "../define.js";

export default defineCard({
  name: "Soulless Jailer",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Golem"],
  power: 0,
  toughness: 4,
  text: "Permanent cards in graveyards can't enter the battlefield.\nPlayers can't cast noncreature spells from graveyards or exile.",
  static: [
    { affects: { scope: "self" }, prohibits: [{ act: "enter", object: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"], inZone: "graveyard" } }], text: "Permanent cards in graveyards can't enter the battlefield." },
    { affects: { scope: "self" }, prohibits: [{ act: "cast", who: "each-player", filter: { notTypes: ["creature"] }, from: ["graveyard", "exile"] }], text: "Players can't cast noncreature spells from graveyards or exile." },
  ],
});
