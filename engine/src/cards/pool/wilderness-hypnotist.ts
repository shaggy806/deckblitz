import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 31909.

const TEXT = "{T}: Target red or green creature gets -2/-0 until end of turn.";

export default defineCard({
  name: "Wilderness Hypnotist",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", anyOf: [{ colors: ["R"] }, { colors: ["G"] }] } }],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
