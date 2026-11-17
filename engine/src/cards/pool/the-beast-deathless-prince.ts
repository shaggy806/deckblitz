import { defineCard } from "../define.js";

// EDHREC rank 11273.
// Stun counters (rule 122.1d): while it has one, untapping it — in its untap
// step or by its own trigger — removes one instead. "Its owner" is the
// creature's (rules 108.3, 111.2): the trigger is for a creature its owner
// doesn't control hitting them, such as the one its cast trigger stole.

const CAST_TEXT =
  "When you cast this spell, gain control of target creature until end of turn. Untap it. It gains menace and haste until end of turn.";
const ENTER_TEXT =
  "The Beast enters tapped with six stun counters on it. (If it would become untapped, remove a stun counter from it instead.)";
const OWNER_TEXT = "Whenever a creature deals combat damage to its owner, untap The Beast and draw a card.";

export default defineCard({
  name: "The Beast, Deathless Prince",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  text: `${CAST_TEXT}\n${ENTER_TEXT}\n${OWNER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true, counters: { kind: "stun", amount: 6 } },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "any", filter: { type: "creature" }, toOwner: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: "source" },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: OWNER_TEXT,
    },
  ],
});
