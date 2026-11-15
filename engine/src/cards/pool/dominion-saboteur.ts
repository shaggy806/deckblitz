import { defineCard } from "../define.js";

// EDHREC rank 21833.

const TEXT =
  "You may have this creature enter as a copy of any artifact or creature on the battlefield, except it isn't legendary. If you do, it enters with additional counters on it equal to the same number and kinds of counters the copied permanent has on it.";

// The counters are an additional effect of copying (rule 707.9e): only if
// it copies something, counted as the copy is chosen.
export default defineCard({
  name: "Dominion Saboteur",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 3,
  toughness: 3,
  text: TEXT,
  copyOnEnter: {
    filter: { typesAnyOf: ["artifact", "creature"] },
    except: { removeSupertypes: ["legendary"] },
    copiedCounters: true,
  },
});
