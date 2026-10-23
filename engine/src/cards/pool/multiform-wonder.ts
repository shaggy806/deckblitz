import { defineCard } from "../define.js";

// Kaladesh. EDHREC rank 19756. Each ability is announced as it's activated,
// and its choice is made as it resolves (the ruling): an un-announced
// `modal`, as Assassin Initiate's and Brightling's are.
const ENTER_TEXT = "When this creature enters, you get {E}{E}{E} (three energy counters).";
const KEYWORD_TEXT = "Pay {E}: This creature gains your choice of flying, vigilance, or lifelink until end of turn.";
const PT_TEXT = "Pay {E}: This creature gets +2/-2 or -2/+2 until end of turn.";

export default defineCard({
  name: "Multiform Wonder",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\n${KEYWORD_TEXT}\n${PT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 1 },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Flying", effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" } },
          { text: "Vigilance", effect: { kind: "grant-keyword", target: "source", keyword: "vigilance", duration: "end-of-turn" } },
          { text: "Lifelink", effect: { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" } },
        ],
      },
      resolve: null,
      text: KEYWORD_TEXT,
    },
    {
      cost: { mana: null, tap: false, payEnergy: 1 },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "+2/-2", effect: { kind: "modify-pt", target: "source", power: 2, toughness: -2, duration: "end-of-turn" } },
          { text: "-2/+2", effect: { kind: "modify-pt", target: "source", power: -2, toughness: 2, duration: "end-of-turn" } },
        ],
      },
      resolve: null,
      text: PT_TEXT,
    },
  ],
});
