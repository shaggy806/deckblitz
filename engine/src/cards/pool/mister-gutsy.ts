import { defineCard } from "../define.js";

// EDHREC rank 9697. Fallout.
//
// A `cast-spell` trigger over Aura or Equipment spells (`subtypes` is an OR —
// Sram, Senior Edificer's shape); Mister Gutsy is neither, so it never sees
// its own cast. The dies trigger counts its +1/+1 counters as it last existed
// on the battlefield (Chasm Skulker's shape).
const CAST_TEXT = "Whenever you cast an Aura or Equipment spell, put a +1/+1 counter on this creature.";
const DIES_TEXT =
  "When this creature dies, create X Junk tokens, where X is the number of +1/+1 counters on it. (They're artifacts with \"{T}, Sacrifice this token: Exile the top card of your library. You may play that card this turn. Activate only as a sorcery.\")";

export default defineCard({
  name: "Mister Gutsy",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Soldier"],
  power: 1,
  toughness: 1,
  text: `${CAST_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtypes: ["Aura", "Equipment"] } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Junk Token", count: { countersOn: "source", counter: "+1/+1" } },
      resolve: null,
      text: "When this creature dies, create X Junk tokens, where X is the number of +1/+1 counters on it.",
    },
  ],
});
