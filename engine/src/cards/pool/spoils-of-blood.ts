import { defineCard } from "../define.js";

// EDHREC rank 15441.
// X counts every creature that died this turn, under anyone's control, read
// as the spell resolves — so ones that died in response count (the ruling).
export default defineCard({
  name: "Spoils of Blood",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Create an X/X black Horror creature token, where X is the number of creatures that died this turn.",
  effect: {
    kind: "create-token",
    token: "Horror Token (Black 0/0)",
    count: 1,
    basePt: {
      power: { creaturesDiedThisTurn: true, anyController: true },
      toughness: { creaturesDiedThisTurn: true, anyController: true },
    },
  },
});
