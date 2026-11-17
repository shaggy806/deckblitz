import { defineCard } from "../define.js";

// EDHREC rank 12877.
//
// "As this creature enters, you may choose" is `choosePermanentOnEnter`
// (`optional`), kept as its chosen permanent (rule 607.2d); the lock and the
// grant name it by the `chosenBySource` filter, in the stint it was chosen in
// (rule 400.7). The copies are this creature's own abilities, so the lock
// doesn't reach them, and an ability that names its card means this creature
// (rule 201.5b, the ruling). Mana abilities are copied too: only loyalty
// abilities are left out.
const CHOOSE = "As this creature enters, you may choose a nonland permanent.";
const LOCK = "Activated abilities of the chosen permanent can't be activated.";
const GRANT = "This creature has all activated abilities of the chosen permanent except for loyalty abilities.";
const SPEND = "You may spend mana as though it were mana of any color to activate those abilities.";

export default defineCard({
  name: "Scheming Fence",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 2,
  toughness: 3,
  text: `${CHOOSE}\n${LOCK}\n${GRANT} ${SPEND}`,
  choosePermanentOnEnter: {
    filter: { notTypes: ["land"] },
    optional: true,
    prompt: "You may choose a nonland permanent",
  },
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "activate", who: "each-player", of: { chosenBySource: true } }],
      text: LOCK,
    },
    {
      affects: { scope: "self" },
      grantsActivatedOf: { zone: "battlefield", filter: { chosenBySource: true }, except: "loyalty" },
      text: GRANT,
    },
    {
      affects: { scope: "self" },
      spendManaAs: { as: "any-color", activating: "granted" },
      text: SPEND,
    },
  ],
});
