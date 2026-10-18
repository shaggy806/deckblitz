import { defineCard } from "../define.js";

// EDHREC rank 10625.
// Makes Phyrexian Mite → use "Phyrexian Mite Token".

const ENTERS_TEXT =
  "When this creature enters, create two 1/1 colorless Phyrexian Mite artifact creature tokens with toxic 1 and \"This token can't block.\" (Players dealt combat damage by them also get a poison counter.)";

export default defineCard({
  name: "Basilica Shepherd",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Mite Token", count: 2 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
