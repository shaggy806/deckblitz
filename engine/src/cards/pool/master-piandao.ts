import { defineCard } from "../define.js";

// EDHREC rank 8935. Adaptive Omnitool's attack-trigger look, over Astor's
// "reveal an X, Y, or Z card" filter.
const ATTACK_TEXT =
  "Whenever Master Piandao attacks, look at the top four cards of your library. You may reveal an Ally, Equipment, or Lesson card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Master Piandao",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Ally"],
  power: 4,
  toughness: 4,
  keywords: ["first-strike"],
  text: `First strike\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { subtypes: ["Ally", "Equipment", "Lesson"] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
