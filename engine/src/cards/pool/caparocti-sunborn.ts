import { defineCard } from "../define.js";

// EDHREC rank 12510.
//
// "You may tap two untapped artifacts and/or creatures you control. If you
// do, discover 3": Aziza, Mage Tower Captain's shape — offered only while you
// control two such permanents, then exactly two are tapped (Caparocti itself
// may be one, if it's untapped — vigilance, the ruling; summoning sickness
// doesn't matter, as tapping isn't a {T} cost) before the discover.
const UNTAPPED = { typesAnyOf: ["artifact", "creature"], controlledBy: "you", tapped: false } as const;
const ATTACK_TEXT =
  "Whenever Caparocti Sunborn attacks, you may tap two untapped artifacts and/or creatures you control. If you do, discover 3. (Exile cards from the top of your library until you exile a nonland card with mana value 3 or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)";

export default defineCard({
  name: "Caparocti Sunborn",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 4,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: UNTAPPED, atLeast: 2 },
        then: {
          kind: "may",
          prompt: "Tap two untapped artifacts and/or creatures you control to discover 3?",
          effect: {
            kind: "sequence",
            effects: [
              {
                kind: "choose-permanents",
                filter: UNTAPPED,
                min: 2,
                upTo: 2,
                then: { kind: "tap", target: 0 },
                prompt: "Tap two untapped artifacts and/or creatures you control",
              },
              { kind: "discover", amount: 3 },
            ],
          },
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
