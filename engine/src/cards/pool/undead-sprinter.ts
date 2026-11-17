import { defineCard } from "../define.js";

// EDHREC rank 13280. The card's own permission (`mayPlaySelf`, rule 113.6f),
// open while a non-Zombie creature has died this turn (judged as it last
// existed on the battlefield). "If you do" is the permission's `entersWith`:
// only a cast under this permission — not one under Gisa and Geralf's or
// another permission reaching it in the graveyard (the player names which,
// rule 601.3) — enters with the counter (rule 614.1c). Countered or dead
// again, it may be cast this way again (the rulings).

const CAST =
  "You may cast this card from your graveyard if a non-Zombie creature died this turn. If you do, this creature enters with a +1/+1 counter on it.";

export default defineCard({
  name: "Undead Sprinter",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  keywords: ["trample", "haste"],
  text: `Trample, haste\n${CAST}`,
  mayPlaySelf: {
    from: ["graveyard"],
    if: {
      kind: "turn-history",
      what: "died",
      who: "any-player",
      filter: { type: "creature", notSubtypes: ["Zombie"] },
    },
    entersWith: { kind: "+1/+1", amount: 1 },
  },
});
