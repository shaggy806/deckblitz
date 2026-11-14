import { defineCard } from "../define.js";

// - The mana values are read as things are now: a token that isn't a copy is
//   0, and so is an {X} on the battlefield (the ruling), so a Treasure gives
//   protection from every land and token. A spell's mana value counts its X.

const STATIC_TEXT = "Artifacts you control have protection from each mana value among artifacts you control.";

export default defineCard({
  name: "Rebbec, Architect of Ascension",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 4,
  pairing: { kind: "partner" },
  text: `${STATIC_TEXT}\nPartner (You can have two commanders if both have partner.)`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "artifact", controlledBy: "you" } },
      protection: { manaValuesAmong: { type: "artifact", controlledBy: "you" } },
      text: STATIC_TEXT,
    },
  ],
});
