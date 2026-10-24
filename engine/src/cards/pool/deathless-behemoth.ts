import { defineCard } from "../define.js";

const TEXT = "Sacrifice two Eldrazi Scions: Return this card from your graveyard to your hand. Activate only as a sorcery.";

export default defineCard({
  name: "Deathless Behemoth",
  manaCost: "{6}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 6,
  toughness: 6,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  activated: [
    {
      // An Eldrazi Scion is both an Eldrazi and a Scion (Drowner of Hope's filter).
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Eldrazi", subtypes: ["Scion"] }, count: 2 } },
      zone: "graveyard",
      staysInZone: true,
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
