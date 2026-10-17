import { defineCard } from "../define.js";

/** 3/3 black Dalek artifact creature with menace — Doctor Who's Dalek token
 * (Genesis of the Daleks, Doomsday Confluence, The Dalek Emperor, Cult of Skaro). */
export default defineCard({
  name: "Dalek Token",
  art: "8fde90b3-cd39-4ac5-b326-9ecc3d7d0d04",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Dalek"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: "Menace",
});
