import { defineCard } from "../define.js";

const PROWESS = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const DOUBLE_STRIKE_TEXT =
  "Whenever you cast a noncreature spell, you may pay {R/W}{R/W}. If you do, target creature gains double strike until end of turn.";

export default defineCard({
  name: "Shu Yun, the Silent Tempest",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 3,
  toughness: 2,
  text: `${PROWESS}\n${DOUBLE_STRIKE_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS,
    },
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Pay {R/W}{R/W} to give the target creature double strike until end of turn?",
        cost: "{R/W}{R/W}",
        effect: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
      },
      resolve: null,
      text: DOUBLE_STRIKE_TEXT,
    },
  ],
});
