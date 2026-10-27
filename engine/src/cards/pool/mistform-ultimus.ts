import { defineCard } from "../define.js";

// "Is every creature type (even if this card isn't on the battlefield)" is a
// characteristic-defining ability (rule 604.3), so it's `alsoSubtypes` — layer
// 4 first, in every zone, and kept when its abilities are removed (the
// rulings); an effect that sets its creature types replaces it.
export default defineCard({
  name: "Mistform Ultimus",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Illusion"],
  alsoSubtypes: ["(every creature type)"],
  power: 3,
  toughness: 3,
  text: "Mistform Ultimus is every creature type (even if this card isn't on the battlefield).",
});
