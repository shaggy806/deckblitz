import { defineCard } from "../define.js";

// EDHREC rank 19371.
//
// "Exiled with this creature" is what its own delve exiled as it was cast
// (rule 607.2q — `exiledWith`). The ruling: the ability still finds them if it
// leaves while the ability is on the stack (the stint it triggered from).
const ATTACK_TEXT =
  "Whenever this creature attacks, you may return an instant or sorcery card exiled with this creature to its owner's hand.";

export default defineCard({
  name: "Ethereal Forager",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Whale"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  delve: true,
  text: `Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\nFlying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exiled-with-source",
        min: 0,
        max: 1,
        filter: { typesAnyOf: ["instant", "sorcery"] },
        destination: "hand",
        leftover: "stay",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
