import { defineCard } from "../define.js";

// EDHREC rank 9651.
//
// A granted {T} ability, so each nontoken creature needs to have been under
// its controller's control since the turn began (rule 302.6) — Ghired has
// haste himself. The copy is Esika's Chariot's `create-token-copy`: the
// token's copiable values only (what it copies, if anything), not its
// counters, tapped state or other effects (the rulings).
const GRANTED_TEXT = "{T}: Create a token that's a copy of target token you control that entered this turn.";
const STATIC_TEXT = `Nontoken creatures you control have "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Ghired, Mirror of the Wilds",
  manaCost: "{R}{G}{W}",
  colors: ["R", "G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${STATIC_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", token: false } },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [{ kind: "permanent", whose: "you", filter: { token: true, enteredThisTurn: true } }],
          effect: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
});
