import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 20403.
const LOSE_TEXT = "{4}: This creature loses defender until end of turn.";
const UNTAP_TEXT = "{T}: Untap target permanent.";

export default defineCard({
  name: "Tidewater Minion",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Minion"],
  power: 4,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${LOSE_TEXT}\n${UNTAP_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      effect: { kind: "lose-keywords", target: "source", keywords: ["defender"], duration: "end-of-turn" },
      resolve: null,
      text: LOSE_TEXT,
    },
    {
      cost: { mana: null, tap: true },
      targets: ["permanent"],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
