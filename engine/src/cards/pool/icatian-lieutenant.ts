import { defineCard } from "../define.js";

// Fallen Empires. EDHREC rank 31882.
const TEXT = "{1}{W}: Target Soldier creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Icatian Lieutenant",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Soldier" } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
