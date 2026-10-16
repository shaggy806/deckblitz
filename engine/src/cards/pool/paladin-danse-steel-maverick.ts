import { defineCard } from "../define.js";

// EDHREC rank 7354. Fallout.
//
// Which creatures gain indestructible is fixed as the ability resolves (the
// ruling): `grant-keyword-all` grants it to each match then, so one that
// becomes an artifact or Human later in the turn doesn't get it. Exiling
// Paladin Danse is the cost.
const EXILE_TEXT =
  "Exile Paladin Danse: Each creature you control that's an artifact or Human gains indestructible until end of turn.";

export default defineCard({
  name: "Paladin Danse, Steel Maverick",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Synth", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance", "lifelink"],
  text: `Vigilance, lifelink\n${EXILE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, exileSelf: true },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: {
          type: "creature",
          controlledBy: "you",
          anyOf: [{ type: "artifact" }, { subtype: "Human" }],
        },
        keyword: "indestructible",
        duration: "end-of-turn",
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
