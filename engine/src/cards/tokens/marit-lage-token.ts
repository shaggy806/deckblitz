import { defineCard } from "../define.js";

/** Marit Lage, a legendary 20/20 black Avatar creature token with flying and
 * indestructible (Marit Lage's Slumber, Dark Depths). Keyed " Token" and
 * named by `tokenName`, so the legend rule sees two of them as the same name. */
export default defineCard({
  name: "Marit Lage Token",
  tokenName: "Marit Lage",
  art: "7b993828-e139-4cb6-a329-487accc1c515",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 20,
  toughness: 20,
  keywords: ["flying", "indestructible"],
  text: "Flying, indestructible",
});
