import { defineCard } from "../define.js";

const COMBAT =
  "At the beginning of combat on your turn, you may have Gogo become a copy of another target creature you control until end of turn, except its name is Gogo, Mysterious Mime. If you do, Gogo and that creature each get +2/+0 and gain haste until end of turn and attack this turn if able.";

export default defineCard({
  name: "Gogo, Mysterious Mime",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Wizard"],
  power: 2,
  toughness: 2,
  text: COMBAT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "may",
        prompt: "Have Gogo become a copy of that creature until end of turn?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "become-copy",
              target: "source",
              of: 0,
              until: "end-of-turn",
              exceptions: { name: "Gogo, Mysterious Mime" },
            },
            { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
            { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
            { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
            { kind: "attack-requirement", target: "source", otherThanYou: false, duration: "end-of-turn" },
            { kind: "attack-requirement", target: 0, otherThanYou: false, duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: COMBAT,
    },
  ],
});
