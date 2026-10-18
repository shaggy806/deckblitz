import { defineCard } from "../define.js";

// EDHREC rank 9676.
// Makes Phyrexian Mite → use "Phyrexian Mite Token".

const DAMAGE_MODE =
  "Charge of the Mites deals damage equal to the number of creatures you control to target creature or planeswalker.";
const TOKEN_MODE =
  "Create two 1/1 colorless Phyrexian Mite artifact creature tokens with toxic 1 and \"This token can't block.\" (Players dealt combat damage by them also get a poison counter.)";

export default defineCard({
  name: "Charge of the Mites",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `Choose one —\n• ${DAMAGE_MODE}\n• ${TOKEN_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DAMAGE_MODE,
        targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
        effect: { kind: "damage", target: 0, amount: { countOf: { type: "creature", controlledBy: "you" } } },
      },
      {
        text: TOKEN_MODE,
        effect: { kind: "create-token", token: "Phyrexian Mite Token", count: 2 },
      },
    ],
  },
});
