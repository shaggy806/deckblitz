import { defineCard } from "../define.js";

// EDHREC rank 30939.
//
// Both exceptions are copiable values (rule 707.9b): the added
// characteristic-defining ability sets its power and toughness in layer 7a,
// over the copied printed values.

const PT_TEXT =
  "This creature's power and toughness are each equal to the number of differently named lands you control.";
const CLONE_TEXT =
  "Strange new worlds — You may have this creature enter as a copy of any creature on the battlefield, except it " +
  `isn't legendary and it has "${PT_TEXT}"`;

export default defineCard({
  name: "Colossal Clone Master",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 0,
  toughness: 0,
  text: CLONE_TEXT,
  copyOnEnter: {
    filter: { type: "creature" },
    except: {
      removeSupertypes: ["legendary"],
      static: [
        {
          affects: { scope: "self" },
          setBasePtFromCount: {
            countOf: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } },
            plusPower: 0,
            plusToughness: 0,
          },
          text: PT_TEXT,
        },
      ],
    },
  },
});
