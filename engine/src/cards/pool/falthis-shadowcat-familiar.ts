import { defineCard } from "../define.js";

// EDHREC rank 7071.
// Every commander you control, whatever its type (Guardian Augmenter's
// scope); with two, both.
const GRANT_TEXT = "Commanders you control have menace and deathtouch.";

export default defineCard({
  name: "Falthis, Shadowcat Familiar",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Nightmare", "Cat"],
  power: 2,
  toughness: 2,
  pairing: { kind: "partner" },
  text: `${GRANT_TEXT}\nPartner (You can have two commanders if both have partner.)`,
  static: [
    {
      affects: { scope: "filter", filter: { isCommander: true, controlledBy: "you" } },
      grantKeywords: ["menace", "deathtouch"],
      text: GRANT_TEXT,
    },
  ],
});
