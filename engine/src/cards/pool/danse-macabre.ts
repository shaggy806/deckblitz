import { defineCard } from "../define.js";

// EDHREC rank 7493.
//
// Reign of the Pit's edict: each player chooses in turn order, then all are
// sacrificed at once, before the roll (the rulings). The roll adds the
// toughness of the creature *you* sacrificed, as it last existed — none
// added if you sacrificed nothing (the ruling). The creature cards are
// chosen as it resolves from those the edict put into any graveyard
// (Zero Point Ballad's shape) — a token never is one. A sacrificed
// commander is still in its graveyard until the spell has finished
// resolving (rule 903.9a), so it can be chosen and stays (the ruling).
const TEXT =
  "Each player sacrifices a nontoken creature of their choice. Roll a d20 and add the toughness of the creature you sacrificed this way.\n1—14 | Return a creature card put into a graveyard this way to the battlefield under your control.\n15+ | Return up to two creature cards put into graveyards this way to the battlefield under your control.";

const RETURN = (min: number, max: number) =>
  ({
    kind: "look-and-choose",
    zone: "graveyards",
    min,
    max,
    destination: "battlefield",
    leftover: "stay",
    filter: { type: "creature", thisWay: "put-into-graveyard" },
  }) as const;

export default defineCard({
  name: "Danse Macabre",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "each-player", filter: { type: "creature", token: false }, count: 1 },
      {
        kind: "roll-dice",
        sides: 20,
        modifier: { thisWay: "sacrificed", who: "you", sumOf: "toughness" },
        table: [
          { min: 1, max: 14, effect: RETURN(1, 1) },
          { min: 15, effect: RETURN(0, 2) },
        ],
      },
    ],
  },
});
