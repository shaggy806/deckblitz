import { defineCard } from "../define.js";

// Skyclave Apparition's X/X blue Illusion: it prints 0/0 and gets its size
// from `create-token`'s `basePt` as it's made.
export default defineCard({
  name: "Illusion Token (Skyclave Apparition)",
  // ZNR's */* blue Illusion, which Scryfall lists among Skyclave
  // Apparition's tokens (`token:art` can't match its X/X).
  art: "2300635e-7771-4676-a5a5-29a9d8f49f1a",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 0,
  toughness: 0,
  text: "",
});
