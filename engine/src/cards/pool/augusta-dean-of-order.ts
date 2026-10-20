import { defineCard } from "../define.js";

// The back face of Plargg, Dean of Chaos // Augusta, Dean of Order.
//
// Rulings:
//   [2021-04-16] Augusta's last ability triggers whenever you attack with any creatures, even if
//     you didn't attack with Augusta.
//   [2021-04-16] Augusta's last ability untaps all creatures you control, not just the ones that
//     attacked this turn. Then you choose which creatures to tap, if any.
//   [2021-04-16] Untapping an attacking creature doesn't remove it from combat. It's still
//     attacking normally.
//   [2021-04-16] Despite the term "other tapped creatures," Augusta's first ability doesn't care
//     whether Augusta is tapped or untapped. The same is true for the second ability. Both
//     abilities apply as long as Augusta is on the battlefield.
const ATTACK_TEXT =
  "Whenever you attack, untap each creature you control, then tap any number of creatures you control.";

export default defineCard({
  name: "Augusta, Dean of Order",
  art: "https://cards.scryfall.io/art_crop/back/5/b/5bd9b5cf-f018-48af-a081-995ce8ecc539.jpg",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  text: `Other tapped creatures you control get +1/+0.\nOther untapped creatures you control get +0/+1.\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", tapped: true }, excludeSelf: true },
      grantPt: [1, 0],
      text: "Other tapped creatures you control get +1/+0.",
    },
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", tapped: false }, excludeSelf: true },
      grantPt: [0, 1],
      text: "Other untapped creatures you control get +0/+1.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
          {
            kind: "choose-permanents",
            filter: { type: "creature", controlledBy: "you", tapped: false },
            min: 0,
            upTo: { countOf: { type: "creature", controlledBy: "you", tapped: false } },
            then: { kind: "tap", target: 0 },
            prompt: "Tap any number of creatures you control",
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Plargg, Dean of Chaos", "Augusta, Dean of Order"],
});
