import { defineCard } from "../define.js";

// EDHREC rank 16563.
//
// The return is a delayed trigger at the next end of combat step (rule
// 511.2) keyed to the targeted creature: one that has left the battlefield
// since isn't returned, even if it came back (rule 400.7). With no target
// chosen, nothing happens.
const TEXT =
  "Whenever this creature attacks, up to one target attacking creature gets +2/+0 and gains trample until end of turn. Return that creature to its owner's hand at end of combat.";

export default defineCard({
  name: "Scrappy Bruiser",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Raccoon", "Warrior"],
  power: 3,
  toughness: 4,
  text: `${TEXT} (Return it only if it's on the battlefield.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { type: "creature", attacking: true } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: "end-of-combat",
            effect: { kind: "return-to-hand", target: 0 },
            text: "Return that creature to its owner's hand.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
