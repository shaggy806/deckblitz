import { defineCard } from "../define.js";

// EDHREC rank 12695.

const PING_TEXT = "{T}: This creature deals 1 damage to target player or planeswalker.";
const UNTAP_TEXT = "Whenever you cast a red spell, you may untap this creature.";

export default defineCard({
  name: "Cinder Pyromancer",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 0,
  toughness: 1,
  text: `${PING_TEXT}\n${UNTAP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["R"] } },
      targets: [],
      effect: { kind: "may", prompt: "Untap Cinder Pyromancer?", effect: { kind: "untap", target: "source" } },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
