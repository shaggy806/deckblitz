import { defineCard } from "../define.js";

// EDHREC rank 10699. Marvel Super Heroes.
//
// The dying creature is matched as it last existed on the battlefield
// (attacking, and yours) — Ares himself included. The card comes back only
// if it's still in the graveyard it died into (Koll, the Forgemaster's
// shape); a token has ceased to exist by then.

const ATTACK_TEXT = "Ares attacks each combat if able.";
const DIES_TEXT = "Whenever an attacking creature you control dies, return that card to its owner's hand.";

export default defineCard({
  name: "Ares, God of War",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God", "Warrior", "Villain"],
  power: 4,
  toughness: 3,
  text: `${ATTACK_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: ATTACK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", attacking: true } },
      targets: [],
      effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
