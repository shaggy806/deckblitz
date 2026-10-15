import { defineCard } from "../define.js";

// EDHREC rank 18569.
//
// The attack trigger exiles the creature, then puts that card back under its
// owner's — your — control tapped and attacking (rule 508.4): a new object
// (rule 400.7) that was never declared as an attacker, so "whenever a
// creature attacks" doesn't see it, attacking a player or planeswalker you
// choose (the rulings). A token exiled this way can't come back (rule
// 111.8), so only a nontoken card exiled this way is returned.

const ALLIANCE_TEXT =
  "Alliance — Whenever another creature you control enters, The Neutrinos get +1/+0 until end of turn.";
const ATTACK_TEXT =
  "Whenever The Neutrinos attack, exile up to one target creature you own, then return it to the battlefield under your control tapped and attacking.";

export default defineCard({
  name: "The Neutrinos",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Rebel"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ALLIANCE_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: ALLIANCE_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { type: "creature", ownedBy: "you" } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", filter: { token: false } },
            then: {
              kind: "put-onto-battlefield",
              target: 0,
              underYourControl: true,
              enterTapped: true,
              attacking: "choose",
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
