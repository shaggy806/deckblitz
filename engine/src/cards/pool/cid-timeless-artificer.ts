import { defineCard } from "../define.js";

// "For each Artificer you control and each Artificer card in your graveyard": two counts,
// one static each over the same creatures.

const PUMP_TEXT =
  "Artifact creatures and Heroes you control get +1/+1 for each Artificer you control and each Artificer card in your graveyard.";
const AFFECTED = {
  scope: "filter",
  filter: { type: "creature", controlledBy: "you", anyOf: [{ type: "artifact" }, { subtype: "Hero" }] },
} as const;

export default defineCard({
  name: "Cid, Timeless Artificer",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 4,
  toughness: 4,
  text: `${PUMP_TEXT}\nA deck can have any number of cards named Cid, Timeless Artificer.\nCycling {W}{U} ({W}{U}, Discard this card: Draw a card.)`,
  deckCopies: "any",
  cycling: { cost: "{W}{U}" },
  static: [
    {
      affects: AFFECTED,
      grantPtPerCount: { filter: { subtype: "Artificer", controlledBy: "you" }, pt: [1, 1] },
      text: PUMP_TEXT,
    },
    {
      affects: AFFECTED,
      grantPtPerCount: { inGraveyard: { subtype: "Artificer", ownedBy: "you" }, pt: [1, 1] },
      text: PUMP_TEXT,
    },
  ],
});
