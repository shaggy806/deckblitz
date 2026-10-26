import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 29629.
//
// Flanking is Benalish Cavalry's trigger. The attack pump reads the attacking
// creatures with flanking as it resolves.

const ATTACK_TEXT = "Whenever Telim'Tor attacks, all attacking creatures with flanking get +1/+1 until end of turn.";

export default defineCard({
  name: "Telim'Tor",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flanking"],
  text: `Flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self", blocker: { notKeyword: "flanking" } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Flanking",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true, keyword: "flanking" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
