import { defineCard } from "../define.js";

const COPY_TEXT =
  "You may have Chameleon enter as a copy of a creature you control, except his name is Chameleon, Master of Disguise.";

// Sakashima the Impostor's copy-on-enter, from your own creatures only.
export default defineCard({
  name: "Chameleon, Master of Disguise",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Shapeshifter", "Villain"],
  power: 2,
  toughness: 3,
  mayhem: { cost: "{2}{U}" },
  copyOnEnter: {
    filter: { type: "creature", controlledBy: "you" },
    except: { name: "Chameleon, Master of Disguise" },
  },
  text:
    `${COPY_TEXT}\n` +
    "Mayhem {2}{U} (You may cast this card from your graveyard for {2}{U} if you discarded it this turn. Timing rules still apply.)",
});
