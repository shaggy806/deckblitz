import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 17637.
//
// Rulings:
//   Chroma abilities check only mana costs, count hybrid mana symbols of the appropriate
//   color, and count this card's own mana cost too.
//
// Chroma over the permanents you control is devotion (rule 700.5): `devotionTo`, read as
// the trigger resolves.

export default defineCard({
  name: "Springjack Shepherd",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Wizard"],
  power: 1,
  toughness: 2,
  text: "Chroma — When this creature enters, create a 0/1 white Goat creature token for each white mana symbol in the mana costs of permanents you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Goat Token", count: { devotionTo: "W" } },
      resolve: null,
      text: "Chroma — When this creature enters, create a 0/1 white Goat creature token for each white mana symbol in the mana costs of permanents you control.",
    },
  ],
});
