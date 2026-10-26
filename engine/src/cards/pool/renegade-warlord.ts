import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 31647. Wingnut's attack trigger: the other
// creatures attacking as it resolves.

const ATTACK_TEXT = "Whenever this creature attacks, each other attacking creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Renegade Warlord",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
