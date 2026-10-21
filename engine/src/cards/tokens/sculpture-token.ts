import { defineCard } from "../define.js";

// A colorless Sculpture artifact creature token, a star/star — "This token's
// power and toughness are each equal to the number of Sculptures you control"
// (a characteristic-defining ability, rule 604.3; it counts itself). Doomed
// Artisan's.
export default defineCard({
  name: "Sculpture Token",
  art: "7711a586-37f9-4560-b25d-4fb339d9cd55",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Sculpture"],
  power: 0,
  toughness: 0,
  text: "This token's power and toughness are each equal to the number of Sculptures you control.",
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Sculpture", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: "This token's power and toughness are each equal to the number of Sculptures you control.",
    },
  ],
});
