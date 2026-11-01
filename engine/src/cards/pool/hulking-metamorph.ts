import { defineCard } from "../define.js";

const PROTOTYPE_TEXT =
  "Prototype {2}{U}{U} — 3/3 (You may cast this spell with different mana cost, color, and size. It keeps its " +
  "abilities and types.)";
const COPY_TEXT =
  "You may have this creature enter as a copy of an artifact or creature you control, except it's an artifact " +
  "creature in addition to its other types, and its power and toughness are equal to this creature's power and " +
  "toughness.";

// The printed 7/7, or the prototype's 3/3 (its ruling).
export default defineCard({
  name: "Hulking Metamorph",
  manaCost: "{9}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Shapeshifter"],
  power: 7,
  toughness: 7,
  prototype: { cost: "{2}{U}{U}", power: 3, toughness: 3 },
  text: `${PROTOTYPE_TEXT}\n${COPY_TEXT}`,
  copyOnEnter: {
    filter: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" },
    except: { addTypes: ["artifact", "creature"] },
    ownPt: true,
  },
});
