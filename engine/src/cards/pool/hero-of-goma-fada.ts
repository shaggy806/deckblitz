import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 8586.
//
// Rally: one trigger for this creature's own entry and one for each other
// Ally (`thisOrAnother`) — each of several Allies entering at once triggers
// it (the ruling).
const TEXT =
  "Rally — Whenever this creature or another Ally you control enters, creatures you control gain indestructible until end of turn.";

export default defineCard({
  name: "Hero of Goma Fada",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight", "Ally"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "indestructible",
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
