import { defineCard } from "../define.js";

// EDHREC rank 7222. Throne of Eldraine.

export default defineCard({
  name: "Realm-Cloaked Giant",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 7,
  toughness: 7,
  keywords: ["vigilance"],
  text: "Vigilance",
  faces: ["Realm-Cloaked Giant", "Cast Off"],
  adventure: true,
});
