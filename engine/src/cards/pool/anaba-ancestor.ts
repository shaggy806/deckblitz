import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 27111.

const TEXT = "{T}: Another target Minotaur creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Anaba Ancestor",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Spirit"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", subtype: "Minotaur" } } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
