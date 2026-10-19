import { defineCard } from "../define.js";

// The optional tap is a `choose-permanents` of up to one other untapped
// Citizen you control (Gravelgill Scoundrel's shape); "if you do" reads
// whether one was actually tapped this way.
const ATTACK_TEXT =
  "Whenever this creature attacks, you may tap another untapped Citizen you control. If you do, this creature gets +1/+0 and gains lifelink until end of turn.";

export default defineCard({
  name: "Civil Servant",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Cat", "Citizen"],
  power: 2,
  toughness: 3,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { subtype: "Citizen", controlledBy: "you", tapped: false },
            min: 0,
            upTo: 1,
            exceptSource: true,
            then: { kind: "tap", target: 0 },
            prompt: "You may tap another untapped Citizen you control",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "tapped" },
            then: {
              kind: "sequence",
              effects: [
                { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
                { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
