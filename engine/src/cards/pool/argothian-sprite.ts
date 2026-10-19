import { defineCard } from "../define.js";

// EDHREC rank 28316. Only creatures block, so "artifact creatures" is any
// artifact among them.
const EVASION_TEXT = "This creature can't be blocked by artifact creatures.";
const PUMP_TEXT = "{7}: Put two +1/+1 counters on this creature.";

export default defineCard({
  name: "Argothian Sprite",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 2,
  toughness: 2,
  text: `${EVASION_TEXT}\n${PUMP_TEXT}`,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { type: "artifact" }, text: EVASION_TEXT }],
  activated: [
    {
      cost: { mana: "{7}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
