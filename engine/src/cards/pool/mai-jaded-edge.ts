import { defineCard } from "../define.js";

// EDHREC rank 13195. A double strike counter gives her double strike for as
// long as it's on her (rule 122.1b).

const PROWESS_TEXT = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const EXHAUST_TEXT = "Exhaust — {3}: Put a double strike counter on Mai.";

export default defineCard({
  name: "Mai, Jaded Edge",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 1,
  toughness: 3,
  text: `${PROWESS_TEXT}\n${EXHAUST_TEXT} (Activate each exhaust ability only once.)`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "double-strike", amount: 1 },
      resolve: null,
      text: EXHAUST_TEXT,
      exhaust: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
  ],
});
