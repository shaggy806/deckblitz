import { defineCard } from "../define.js";

// Two "next creature spell" effects that are used up by the same spell: the
// flash permission (Quicken's `castAsThoughFlash` with `next`, rule 601.3b)
// and a `next` `grant-spells-this-turn` that makes it uncounterable
// (701.5f) and has it enter with an additional +1/+1 counter. Cast at a time
// it could be cast anyway, the creature still uses both up.

const TEXT =
  "The next creature spell you cast this turn can be cast as though it had flash. That spell can't be countered. That creature enters with an additional +1/+1 counter on it.";

export default defineCard({
  name: "Savage Summoning",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  cantBeCountered: true,
  text: `This spell can't be countered.\n${TEXT}`,
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "player-effect",
        duration: "end-of-turn",
        castAsThoughFlash: { filter: { type: "creature" }, next: true },
      },
      {
        kind: "grant-spells-this-turn",
        next: true,
        filter: { type: "creature" },
        cantBeCountered: true,
        entersWithCounters: { counter: "+1/+1", amount: 1 },
      },
    ],
  },
});
