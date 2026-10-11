import { defineCard } from "../define.js";

// EDHREC rank 7502.
//
// "Other attacking modified creatures" (rule 700.9: a counter, an
// Equipment, or an Aura its controller controls) — whoever controls them, as
// the card says; the set is fixed as the ability resolves (rule 611.2c).
const DRAW_TEXT = "Whenever you draw a card, put a +1/+1 counter on target creature.";
const ATTACK_TEXT =
  "Whenever Iron Man attacks, other attacking modified creatures gain flying until end of turn. (Equipment, Auras you control, and counters are modifications.)";

export default defineCard({
  name: "Iron Man, Armored Avenger",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${DRAW_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", attacking: true, modified: true },
        keyword: "flying",
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: "Whenever Iron Man attacks, other attacking modified creatures gain flying until end of turn.",
    },
  ],
});
