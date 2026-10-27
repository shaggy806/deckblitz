import { defineCard } from "../define.js";

// EDHREC rank 2552.
//
// Rulings:
//   [2020-11-10] An Aura put onto the battlefield this way doesn't target anything (so it could be
//     attached to an opponent's permanent with hexproof, for example), but the Aura's enchant
//     ability restricts what it can be attached to. If the Aura can't legally be attached to
//     anything, you can't choose to put it onto the battlefield at all.
//
// The look-and-choose puts the chosen card onto the battlefield (an Aura's
// host is chosen as it enters, rule 303.4f, untargeted). Then, only if an
// Equipment was put onto the battlefield this way, an untargeted choice of up
// to one creature you control, and that Equipment attached to it (Quest for
// the Holy Relic's shape) — "you may" is choosing none.
const TEXT =
  "Whenever this creature attacks, look at the top six cards of your library. You may put an Aura or Equipment card from among them onto the battlefield. If an Equipment is put onto the battlefield this way, you may attach it to a creature you control. Put the rest of those cards on the bottom of your library in a random order.";

export default defineCard({
  name: "Armored Skyhunter",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: 6,
            min: 0,
            max: 1,
            filter: { anyOf: [{ subtype: "Aura" }, { subtype: "Equipment" }] },
            destination: "battlefield",
            leftover: "bottom-random",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-onto-battlefield", filter: { subtype: "Equipment" }, atLeast: 1 },
            then: {
              kind: "choose-permanents",
              filter: { type: "creature", controlledBy: "you" },
              min: 0,
              upTo: 1,
              prompt: "Choose a creature you control to attach the Equipment to (or none)",
              then: {
                kind: "attach",
                target: 0,
                attachments: { subtype: "Equipment", thisWay: "put-onto-battlefield" },
              },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
