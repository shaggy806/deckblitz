import { defineCard } from "../define.js";

export default defineCard({
  name: "Kunoros, Hound of Athreos",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance", "menace", "lifelink"],
  text: "Vigilance, menace, lifelink\nCreature cards in graveyards can't enter the battlefield.\nPlayers can't cast spells from graveyards.",
  static: [
    { affects: { scope: "self" }, prohibits: [{ act: "enter", object: { type: "creature", inZone: "graveyard" } }], text: "Creature cards in graveyards can't enter the battlefield." },
    { affects: { scope: "self" }, prohibits: [{ act: "cast", who: "each-player", from: ["graveyard"] }], text: "Players can't cast spells from graveyards." },
  ],
});
