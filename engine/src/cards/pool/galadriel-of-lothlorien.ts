import { defineCard } from "../define.js";

// EDHREC rank 7186.
//
// The scry finishes before the top card may be revealed (the ruling).

const TEMPT_TEXT = "Whenever the Ring tempts you, if you chose a creature other than Galadriel as your Ring-bearer, scry 3.";
const SCRY_TEXT =
  "Whenever you scry, you may reveal the top card of your library. If a land card is revealed this way, put it onto the battlefield tapped.";

export default defineCard({
  name: "Galadriel of Lothlórien",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Noble"],
  power: 3,
  toughness: 3,
  text: `${TEMPT_TEXT}\n${SCRY_TEXT}`,
  triggered: [
    {
      trigger: { on: "ring-tempts", who: "you", chosen: "other" },
      targets: [],
      effect: { kind: "scry", amount: 3 },
      resolve: null,
      text: TEMPT_TEXT,
    },
    {
      trigger: { on: "scries", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Reveal the top card of your library?",
        effect: {
          kind: "reveal-top",
          then: {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { type: "land" } },
            then: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
          },
        },
      },
      resolve: null,
      text: SCRY_TEXT,
    },
  ],
});
