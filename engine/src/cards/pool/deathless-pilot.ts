import { defineCard } from "../define.js";

// EDHREC rank 18432.
const PILOT_TEXT = "This creature saddles Mounts and crews Vehicles as though its power were 2 greater.";
const RETURN_TEXT = "{3}{B}: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Deathless Pilot",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Pilot"],
  power: 2,
  toughness: 2,
  text: `${PILOT_TEXT}\n${RETURN_TEXT}`,
  static: [{ affects: { scope: "self" }, crewsAs: { plus: 2, saddles: true }, text: PILOT_TEXT }],
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
