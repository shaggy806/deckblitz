import { defineCard } from "../define.js";

// EDHREC rank 2161.
//
// The token is chosen as the ability resolves, not targeted, and may be the
// Myr it just made. Every other token you control — any kind: a Treasure
// becomes a Myr too — copies the chosen one's copiable values: the original
// characteristics the effect that made it gave it, or what it copies, if it's
// a copy (a token Brudiclad changed before) — never its counters, status or
// other effects (the rulings). The copies last indefinitely, even after
// Brudiclad leaves (rule 611.2a); each keeps its own counters and status
// (rule 707.4). One of a stack of identical tokens chosen, the rest of that
// stack copy what they already are.
const HASTE_TEXT = "Creature tokens you control have haste.";
const COPY_TEXT =
  "At the beginning of combat on your turn, create a 2/1 blue Phyrexian Myr artifact creature token. Then you may choose a token you control. If you do, each other token you control becomes a copy of that token.";

export default defineCard({
  name: "Brudiclad, Telchor Engineer",
  manaCost: "{4}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Artificer"],
  power: 4,
  toughness: 4,
  text: `${HASTE_TEXT}\n${COPY_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", token: true, controlledBy: "you" } },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Phyrexian Myr Token", count: 1 },
          {
            kind: "choose-permanents",
            filter: { token: true, controlledBy: "you" },
            upTo: 1,
            then: {
              kind: "become-copy",
              filter: { token: true, controlledBy: "you" },
              exceptOf: true,
              of: 0,
            },
            prompt: "You may choose a token you control: each other token you control becomes a copy of it",
          },
        ],
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
