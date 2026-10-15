import { defineCard } from "../define.js";

// EDHREC rank 26153.
//
// A green-blue spell triggers both: +1/+0 and trample, then -1/-0 and can't
// be blocked.

const GREEN_TEXT = "Whenever you cast a green spell, Ant-Man gets +1/+0 and gains trample until end of turn.";
const BLUE_TEXT = "Whenever you cast a blue spell, Ant-Man gets -1/-0 until end of turn and can't be blocked this turn.";
const DAMAGE_TEXT = "Whenever Ant-Man deals combat damage to a player, draw a card.";

export default defineCard({
  name: "Ant-Man, Reformed Rogue",
  manaCost: "{2}{G/U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Hero"],
  power: 2,
  toughness: 3,
  text: `${GREEN_TEXT}\n${BLUE_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["G"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: GREEN_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["U"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: -1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: BLUE_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
