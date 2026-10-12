import { defineCard } from "../define.js";

// EDHREC rank 17673. Marvel Super Heroes Commander.
//
// "Soldiers and Heroes you control": every permanent you control with either
// subtype as the ability resolves (rule 611.2c), himself included.
const ENTER_TEXT = "When Captain America enters, Soldiers and Heroes you control gain indestructible until end of turn.";

export default defineCard({
  name: "Captain America, Unbowed",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Hero"],
  power: 3,
  toughness: 4,
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { subtypes: ["Soldier", "Hero"], controlledBy: "you" },
        keyword: "indestructible",
        duration: "end-of-turn",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
