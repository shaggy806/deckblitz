import { defineCard } from "../define.js";

// EDHREC rank 15843. More Than Meets the Eye (rule 702.162a) casts the card
// converted, its back face up (Ultra Magnus, Armored Carrier). Convert is
// transform (701.28a). The artifact creature put onto the battlefield attacks
// a player or planeswalker its controller chooses (the ruling) but was never
// declared as an attacker. "If you do" is a card actually put this way; the
// delayed trigger turns Ultra Magnus over at end of combat.
//
// Rulings:
//   [2022-10-14] Ultra Magnus's controller chooses which player or planeswalker the artifact
//     creature is attacking. It doesn't have to be the same player or planeswalker that Ultra
//     Magnus is attacking.
//   [2022-10-14] An artifact creature card put onto the battlefield by Ultra Magnus, Tactician's
//     last ability is an attacking creature, but since it wasn't declared as an attacker, it never
//     "attacked," and this will not cause abilities that trigger when a creature attacks to
//     trigger.
//   [2022-10-14] When you cast a spell using its More Than Meets the Eye ability, the card is put
//     onto the stack with its back face up. The resulting spell has all characteristics of that
//     face.
const ATTACK_TEXT =
  "Whenever Ultra Magnus attacks, you may put an artifact creature card from your hand onto the battlefield tapped and attacking. If you do, convert Ultra Magnus at end of combat.";

export default defineCard({
  name: "Ultra Magnus, Tactician",
  manaCost: "{4}{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 7,
  toughness: 7,
  text: `More Than Meets the Eye {2}{R}{G}{W} (You may cast this card converted for {2}{R}{G}{W}.)\nWard {2}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            destination: "battlefield",
            leftover: "stay",
            filter: { types: ["artifact", "creature"] },
            enterTapped: true,
            attacking: "choose",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-onto-battlefield", atLeast: 1 },
            then: {
              kind: "delayed-trigger",
              at: { step: "end-combat" },
              effect: { kind: "transform", target: "source" },
              text: "At end of combat, convert Ultra Magnus.",
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Ultra Magnus, Tactician", "Ultra Magnus, Armored Carrier"],
  transform: true,
  moreThanMeetsTheEye: { cost: "{2}{R}{G}{W}" },
});
