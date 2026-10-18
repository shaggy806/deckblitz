import { defineCard } from "../define.js";

// EDHREC rank 14554.
// Rulings: the creatures that gain indestructible are fixed as it resolves
// (rule 611.2c — `grant-keyword-all` reaches only what matches then); with
// its one target illegal it doesn't resolve, so none do.

export default defineCard({
  name: "Resistance Reunited",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn.\nEquipped creatures you control gain indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy them.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you", equipped: true },
        keyword: "indestructible",
        duration: "end-of-turn",
      },
    ],
  },
});
