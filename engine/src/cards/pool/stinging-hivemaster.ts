import { defineCard } from "../define.js";

// EDHREC rank 15939.
// Makes Phyrexian Mite → use "Phyrexian Mite Token".

const DIES_TEXT =
  "When this creature dies, create a 1/1 colorless Phyrexian Mite artifact creature token with toxic 1 and \"This token can't block.\"";

export default defineCard({
  name: "Stinging Hivemaster",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Warlock"],
  power: 3,
  toughness: 2,
  toxic: 1,
  text: `Toxic 1 (Players dealt combat damage by this creature also get a poison counter.)\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Mite Token", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
