import { defineCard } from "../define.js";

export default defineCard({
  name: "Grafdigger's Cage",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "Creature cards in graveyards and libraries can't enter the battlefield.\nPlayers can't cast spells from graveyards or libraries.",
  static: [
    { affects: { scope: "self" }, prohibits: [{ act: "enter", object: { type: "creature", anyOf: [{ inZone: "graveyard" }, { inZone: "library" }] } }], text: "Creature cards in graveyards and libraries can't enter the battlefield." },
    { affects: { scope: "self" }, prohibits: [{ act: "cast", who: "each-player", from: ["graveyard", "library"] }], text: "Players can't cast spells from graveyards or libraries." },
  ],
});
