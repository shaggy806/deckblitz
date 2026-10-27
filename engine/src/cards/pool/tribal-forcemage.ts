import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 20908.
//
// The type is chosen as the trigger resolves; every creature of it gets the
// bonus, each player's.

export default defineCard({
  name: "Tribal Forcemage",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Wizard"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{1}{G}" },
  text: "Morph {1}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, creatures of the creature type of your choice get +2/+2 and gain trample until end of turn.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        then: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt-all", filter: { type: "creature", subtype: "$chosen" }, power: 2, toughness: 2, duration: "end-of-turn" },
            { kind: "grant-keyword-all", filter: { type: "creature", subtype: "$chosen" }, keyword: "trample", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: "When this creature is turned face up, creatures of the creature type of your choice get +2/+2 and gain trample until end of turn.",
    },
  ],
});
