import { defineCard } from "../define.js";

const ALT_TEXT = "You may sacrifice three artifacts rather than pay this spell's mana cost.";
const RETURN_TEXT = "Exile three artifact cards from your graveyard: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Salvage Titan",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 6,
  toughness: 4,
  text: `${ALT_TEXT}\n${RETURN_TEXT}`,
  alternativeCost: {
    mana: "{0}",
    sacrifice: { filter: { type: "artifact" }, count: 3, text: "three artifacts" },
  },
  activated: [
    {
      // The ruling: the Titan may be one of the three, and then it isn't
      // returned (rule 400.7).
      cost: {
        mana: null,
        tap: false,
        exileFromGraveyard: { count: 3, filter: { type: "artifact" }, includingSource: true },
      },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
