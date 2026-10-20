import { defineCard } from "../define.js";
import { exploit } from "../helpers.js";

// EDHREC rank 16890.
//
// It may target a permanent you already control, Infernal Captor included,
// just to untap it and give it haste (the ruling).

export default defineCard({
  name: "Infernal Captor",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil", "Rogue"],
  power: 3,
  toughness: 3,
  text: "Exploit (When this creature enters, you may sacrifice a creature.)\nWhen this creature exploits a creature, gain control of target artifact or creature until end of turn. Untap that permanent. It gains haste until end of turn.",
  triggered: [
    exploit(),
    {
      trigger: { on: "exploits", who: "self" },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "When this creature exploits a creature, gain control of target artifact or creature until end of turn. Untap that permanent. It gains haste until end of turn.",
    },
  ],
});
