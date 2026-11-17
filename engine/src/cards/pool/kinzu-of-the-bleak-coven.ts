import { defineCard } from "../define.js";

// EDHREC rank 13366.
//
// Rulings:
//   - The token copies the creature as it last existed on the battlefield before it died, not as
//     it existed in the graveyard before it was exiled.
//   - Damage dealt by a creature with toxic grants the same number of counters regardless of how
//     much damage is dealt. Notably, if a replacement effect modifies the damage in some way (such
//     as that of Gratuitous Violence), the number of counters given remains unchanged.
//   - If the token is a copy of a creature whose power and toughness are defined by an ability
//     (usually printed as */* or similar), the token doesn't copy the ability that defines its
//     power and toughness. It remains a 1/1 creature.
//   - If the copied creature had {X} in its mana cost, X is 0.
//   - If the copied creature was copying something else, then the token enters the battlefield as
//     whatever that creature copied, with the exceptions noted above.
//   - Except for the listed exceptions, the token copies exactly what was printed on the original
//     creature and nothing else (unless that creature is copying something else; see below). It
//     doesn't copy whether that creature was tapped or untapped, whether it had any counters on it
//     or Auras or Equipment attached to it, or any non-copy effects that had changed its power,
//     toughness, types, color, or so on.
//   - If something becomes a copy of the token, the copy also has base power and toughness 1/1
//     and has toxic 1.
//   - Any enters-the-battlefield abilities of the copied creature will trigger when the token
//     enters the battlefield. Any "as [this creature] enters the battlefield" or "[this creature]
//     enters the battlefield with" abilities of the creature will also work.
//   - Multiple instances of toxic are cumulative. For example, if a creature has toxic 2 and gains
//     toxic 1 due to another effect, combat damage that creature deals to a player will cause that
//     player to get 3 poison counters.
//
// Nightmare Shepherd's shape with a life payment (`costLife`, paid as the "may" is answered; not
// offered below 2 life, rule 119.4): "If you do" is the card exiled from the graveyard it went to
// (rule 400.7). The copy is of the creature as it last existed on the battlefield (rule 608.2h),
// and "1/1 and has toxic 1" are copy exceptions, part of its copiable values (rule 707.9b) — toxic
// one more instance beside any it copied (702.164b).

const DIES_TEXT =
  "Whenever another nontoken creature you control dies, you may pay 2 life and exile it. If you do, create a token that's a copy of that creature, except it's 1/1 and has toxic 1.";

export default defineCard({
  name: "Kinzu of the Bleak Coven",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Vampire"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${DIES_TEXT} (Players dealt combat damage by it also get a poison counter.)`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", otherOnly: true, filter: { type: "creature", token: false } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay 2 life and exile it to create a 1/1 copy of it with toxic 1?",
        costLife: 2,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "trigger-object" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: {
                kind: "create-token-copy",
                of: "trigger-object",
                count: 1,
                who: "you",
                exceptions: { power: 1, toughness: 1, toxic: 1 },
              },
            },
          ],
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
