import { defineCard } from "../define.js";

// The Kamigawa: Neon Dynasty Pilot token (Born to Drive, Prodigy's Prototype,
// Reckoner Bankbuster, Shorikai, Genesis Engine): a 1/1 colorless Pilot that
// crews Vehicles as though its power were 2 greater (rule 702.122a) — crew
// only, never saddle. "Pilot Token" is the Aetherdrift one, which saddles too;
// in the game both are named "Pilot Token" (rule 111.4), hence `tokenName`.
const TEXT = "This creature crews Vehicles as though its power were 2 greater.";

export default defineCard({
  name: "Pilot Token (Crews Vehicles)",
  tokenName: "Pilot Token",
  art: "be84f259-2809-48c9-9c70-861437f08c23",
  colors: [],
  types: ["creature"],
  subtypes: ["Pilot"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [{ affects: { scope: "self" }, crewsAs: { plus: 2 }, text: TEXT }],
});
