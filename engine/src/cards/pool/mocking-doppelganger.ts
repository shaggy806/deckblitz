import { defineCard } from "../define.js";

// A copy with one added ability (rule 707.9a), so a copy of this copy has it too;
// the goader is whoever controls this one. Only what's already on the battlefield
// can be chosen (the ruling); a token's copy isn't a token.
const GOAD_TEXT = "Other creatures with the same name as this creature are goaded.";

export default defineCard({
  name: "Mocking Doppelganger",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 0,
  toughness: 0,
  keywords: ["flash"],
  text: `Flash\nYou may have this creature enter as a copy of a creature an opponent controls, except it has "${GOAD_TEXT}" (They attack each combat if able and attack a player other than you if able.)`,
  copyOnEnter: {
    filter: { type: "creature", controlledBy: "opponent" },
    except: {
      static: [
        {
          affects: { scope: "filter", filter: { type: "creature", sameNameAsSource: true, isSource: false } },
          goads: true,
          text: GOAD_TEXT,
        },
      ],
    },
  },
});
