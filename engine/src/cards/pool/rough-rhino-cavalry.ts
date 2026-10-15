import { defineCard } from "../define.js";
import { firebending } from "../helpers.js";

// EDHREC rank 14149.
const FIREBENDING_TEXT =
  "Firebending 2 (Whenever this creature attacks, add {R}{R}. This mana lasts until end of combat.)";
const EXHAUST_TEXT =
  "Exhaust — {8}: Put two +1/+1 counters on this creature. It gains trample until end of turn. (Activate each exhaust ability only once.)";

export default defineCard({
  name: "Rough Rhino Cavalry",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 5,
  toughness: 5,
  text: `${FIREBENDING_TEXT}\n${EXHAUST_TEXT}`,
  triggered: [firebending(2, FIREBENDING_TEXT)],
  activated: [
    {
      cost: { mana: "{8}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
          { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Exhaust — {8}: Put two +1/+1 counters on this creature. It gains trample until end of turn.",
      exhaust: true,
    },
  ],
});
