import { defineCard } from "../define.js";

// Star Trek Commander (TRC). The count is the attacking non-Faerie creatures
// as the trigger resolves; each token's controller picks what it attacks
// (rule 508.4).

const TEXT =
  "Whenever Worf attacks, for each attacking non-Faerie creature, create a tapped and attacking 1/1 blue Faerie creature token with flying.";

export default defineCard({
  name: "Worf, Still Not Merry",
  manaCost: "{3}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior", "Officer"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Faerie Token",
        count: { countOf: { type: "creature", attacking: true, notSubtypes: ["Faerie"] } },
        tapped: true,
        attacking: "choose",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
