import { defineCard } from "../define.js";

// Mystery Booster Commander. The copies are of the creature as it last
// existed on the battlefield (rule 707.2, 608.2h).
const TEXT =
  "Whenever another nontoken Ooze creature you control dies, create two tokens that are copies of that creature, except they're 2/2 and they aren't legendary.";

export default defineCard({
  name: "Uugguu, the Omniplasm",
  manaCost: "{B}{G}{U}",
  colors: ["B", "G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", subtype: "Ooze", token: false },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "create-token-copy",
        of: "trigger-object",
        count: 2,
        who: "you",
        exceptions: { removeSupertypes: ["legendary"], power: 2, toughness: 2 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
