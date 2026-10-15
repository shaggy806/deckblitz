import { defineCard } from "../define.js";

// EDHREC rank 28254.

const PROWESS_TEXT = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const BLOCK_TEXT =
  "Whenever a creature an opponent controls with power or toughness 1 or less blocks, Tetsuko Umezawa deals 1 damage to that creature's controller.";

// Once per blocker (`blocker-declared`), its power and toughness read as it
// blocks — a trigger filter, not a static's `affects`, so the layer-fold
// limit that blocks Tetsuko Umezawa, Fugitive doesn't apply. "That
// creature's controller" is the blocker's controller, not a target.
export default defineCard({
  name: "Tetsuko Umezawa, Pursuer",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 2,
  toughness: 4,
  keywords: ["double-strike"],
  text: `Double strike\n${PROWESS_TEXT}\n${BLOCK_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
    {
      trigger: {
        on: "blocks",
        who: "opponent",
        filter: {
          type: "creature",
          anyOf: [{ power: { op: "lte", n: 1 } }, { toughness: { op: "lte", n: 1 } }],
        },
      },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: BLOCK_TEXT,
    },
  ],
});
