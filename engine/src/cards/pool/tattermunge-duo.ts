import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 30241.
//
// A red-and-green spell triggers both abilities (the ruling).

const RED_TEXT = "Whenever you cast a red spell, this creature gets +1/+1 until end of turn.";
const GREEN_TEXT =
  "Whenever you cast a green spell, this creature gains forestwalk until end of turn. (It can't be blocked as long as defending player controls a Forest.)";

export default defineCard({
  name: "Tattermunge Duo",
  manaCost: "{2}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior", "Shaman"],
  power: 2,
  toughness: 3,
  text: `${RED_TEXT}\n${GREEN_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["R"] } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: RED_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["G"] } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "forestwalk", duration: "end-of-turn" },
      resolve: null,
      text: GREEN_TEXT,
    },
  ],
});
