import { defineCard } from "../define.js";

// EDHREC rank 2046.
//
// Rulings:
//   [2020-08-07] Arixmethes can tap for mana the turn it enters the battlefield as long as it has
//     slumber counters on it. If you can figure out how to untap it, that is.
//   [2020-08-07] Arixmethes isn't a land until after it has entered the battlefield. Effects such
//     as that of Blood Moon won't affect its enters-the-battlefield ability. Similarly,
//     replacement effects that modify how creatures you control enter the battlefield will see
//     Arixmethes entering as a creature rather than a land. However, triggered abilities (such as
//     landfall abilities) will see that a land has entered the battlefield and not a creature.
//   [2020-08-07] Arixmethes can't be played as a land.
//   [2020-08-07] While Arixmethes is a land, it's still green and blue, it's still legendary, and
//     its mana value is still 4.
//   [2020-08-07] Once Arixmethes is a creature again, it can attack on the same turn as long as
//     you've controlled it since your most recent turn began.
//   [2020-08-07] Arixmethes's effect causing it to be a land overwrites any earlier effects that
//     gave it additional types. For example, a Phyrexian Metamorph that copies Arixmethes will be
//     a land, not an artifact land, until its slumber counters are removed.
//   [2020-08-07] Arixmethes's triggered ability resolves before the spell that caused it to
//     trigger, but after targets have been chosen for that spell. It resolves even if that spell
//     is countered.

export default defineCard({
  name: "Arixmethes, Slumbering Isle",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kraken"],
  power: 12,
  toughness: 12,
  text: "Arixmethes enters tapped with five slumber counters on it.\nAs long as Arixmethes has a slumber counter on it, it's a land. (It's not a creature.)\nWhenever you cast a spell, you may remove a slumber counter from Arixmethes.\n{T}: Add {G}{U}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { all: ["G", "U"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {G}{U}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Remove a slumber counter from Arixmethes?",
        effect: { kind: "remove-counter", target: "source", counter: "slumber", amount: 1 },
      },
      resolve: null,
      text: "Whenever you cast a spell, you may remove a slumber counter from Arixmethes.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true, counters: { kind: "slumber", amount: 5 } },
      text: "Arixmethes enters tapped with five slumber counters on it.",
    },
    {
      // Its card types replaced, in timestamp order with the rest of layer
      // 4 — over an earlier "artifact in addition" too (the Metamorph
      // ruling) — and Kraken with them (rule 205.1a); still legendary, green
      // and blue, mana value 4. The counters go on as it enters, so whatever
      // judges it entering sees a creature, and its triggers a land (the
      // rulings). A land has no summoning sickness: it taps for mana the turn
      // it arrives.
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "slumber", compare: { op: "gte", n: 1 } },
      setTypes: ["land"],
      text: "As long as Arixmethes has a slumber counter on it, it's a land. (It's not a creature.)",
    },
  ],
});
