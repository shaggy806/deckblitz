import { defineCard } from "../define.js";

// Innistrad: Crimson Vow (VOW). EDHREC rank 5109.
//
// The returned creature is a new object (rule 400.7), so the grant names it as
// the card put onto the battlefield this way, for good. Its granted ability is
// a state trigger (rule 603.8): it triggers as soon as its controller controls
// no legendary Vampire, and not again while that ability is on the stack.

const ATTACK_TEXT =
  'Whenever Olivia attacks, return target creature card from your graveyard to the battlefield tapped and attacking. It gains "When you don\'t control a legendary Vampire, exile this creature."';
const GRANTED_TEXT = "When you don't control a legendary Vampire, exile this creature.";

export default defineCard({
  name: "Olivia, Crimson Bride",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Vampire", "Noble"],
  power: 3,
  toughness: 4,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0, enterTapped: true, attacking: "choose" },
          {
            kind: "grant-triggered",
            target: "put-this-way",
            duration: "permanent",
            ability: {
              trigger: {
                on: "state",
                state: {
                  kind: "not",
                  of: { kind: "controls", filter: { supertype: "legendary", subtype: "Vampire" }, atLeast: 1 },
                },
              },
              targets: [],
              effect: { kind: "exile", target: "source" },
              resolve: null,
              text: GRANTED_TEXT,
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
