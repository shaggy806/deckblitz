import { defineCard } from "../define.js";

// It comes back under its owner's control (the graveyard's opponent). All three
// clauses last for as long as it has a duty counter, a new counter later not
// bringing them back (rule 611.2b); "you" is this spell's controller.
const IT = { thisWay: "put-onto-battlefield" } as const;

export default defineCard({
  name: "Immortal Obligation",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Return target creature card from an opponent's graveyard to the battlefield under their control with a duty counter on it. For as long as that creature has a duty counter on it, it is goaded, can't attack you or a permanent you control, and can't block creatures you control.",
  targets: [{ kind: "card-in-graveyard", whose: "opponent", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "duty", amount: 1 } },
      { kind: "goad", filter: IT, duration: { whileCounter: "duty" } },
      {
        kind: "restrict",
        filter: IT,
        asItResolves: true,
        restrictions: [],
        cantAttackYou: true,
        cantBlockYours: true,
        duration: { whileCounter: "duty" },
      },
    ],
  },
});
