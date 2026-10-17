import { defineCard } from "../define.js";

// EDHREC rank 13988. Wilds of Eldraine (Commander-legal first printing). Any
// token counts, not just a creature token. The attack pump is Hemosymbic
// Mite's, X read as it resolves, aimed at another attacking creature.
const TOKEN_TEXT = "Whenever a token you control enters, put a +1/+1 counter on this creature.";
const ATTACK_TEXT =
  "Whenever this creature attacks, another target attacking creature gets +X/+X until end of turn, where X is this creature's power.";

export default defineCard({
  name: "Wildwood Mentor",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 1,
  toughness: 1,
  text: `${TOKEN_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { token: true } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", attacking: true } } }],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { powerOf: "source" },
        toughness: { powerOf: "source" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
