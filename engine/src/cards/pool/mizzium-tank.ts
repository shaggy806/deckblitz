import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

const TEXT =
  "Whenever you cast a noncreature spell, this Vehicle becomes an artifact creature and gets +1/+1 until end of turn.";

// It triggers even while it's already a creature, for another +1/+1 (the
// ruling).
export default defineCard({
  name: "Mizzium Tank",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${TEXT}\nCrew 1 (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  activated: [crew(1)],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-types", target: "source", addTypes: ["artifact", "creature"], duration: "end-of-turn" },
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
