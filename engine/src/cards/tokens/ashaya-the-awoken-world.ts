import { defineCard } from "../define.js";

/**
 * Nissa, Sage Animist's −2 token: Ashaya, the Awoken World, a legendary 4/4
 * green Elemental. A *named legendary* token like Phobos, so the legend rule
 * (704.5j) applies to a second one (Nissa's ruling).
 */
export default defineCard({
  name: "Ashaya, the Awoken World",
  art: "0affd414-f774-48d1-af9e-bff74e58e1ca",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
});
