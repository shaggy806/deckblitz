import { defineCard } from "../define.js";

const BLOOD =
  "Whenever an opponent casts a spell, that player creates a Blood token. (It's an artifact with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")";
const ATTACK = "Whenever this creature attacks, it gets +1/+0 until end of turn for each Blood token defending player controls.";

export default defineCard({
  name: "Bloodvial Purveyor",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 5,
  toughness: 6,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${BLOOD}\n${ATTACK}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: 1, who: "trigger-controller" },
      resolve: null,
      text: BLOOD,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { subtype: "Blood", token: true, controlledBy: "you" }, forPlayer: "trigger-player" },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK,
    },
  ],
});
