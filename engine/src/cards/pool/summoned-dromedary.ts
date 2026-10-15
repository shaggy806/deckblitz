import { defineCard } from "../define.js";

// EDHREC rank 24108. Secrets of Strixhaven.
const RETURN_TEXT = "{1}{W}: Return this card from your graveyard to your hand. Activate only as a sorcery.";

export default defineCard({
  name: "Summoned Dromedary",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Camel"],
  power: 4,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      zone: "graveyard",
      staysInZone: true,
      sorcerySpeed: true,
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
