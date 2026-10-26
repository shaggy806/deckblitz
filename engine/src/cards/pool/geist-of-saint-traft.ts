import { defineCard } from "../define.js";

// EDHREC rank 12572. Invocation of Saint Traft's trigger; the delayed exile
// takes every Angel this made (two under Doubling Season — its ruling), and
// the player or planeswalker each one attacks is chosen.

const ATTACK_TEXT =
  "Whenever Geist of Saint Traft attacks, create a 4/4 white Angel creature token with flying that's tapped and attacking. Exile that token at end of combat.";

export default defineCard({
  name: "Geist of Saint Traft",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Cleric"],
  power: 2,
  toughness: 2,
  keywords: ["hexproof"],
  text: `Hexproof (This creature can't be the target of spells or abilities your opponents control.)\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "4/4 Angel Token", count: 1, tapped: true, attacking: "choose" },
          {
            kind: "delayed-trigger",
            at: "end-of-combat",
            about: "created",
            effect: { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 } },
            text: "Exile that token.",
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
