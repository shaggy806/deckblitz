import { defineCard } from "../define.js";

// EDHREC rank 6907.
//
// "Behold an Elemental and exile it" is a mandatory additional cost (rule
// 701.4a): an Elemental card from the hand or an Elemental you control,
// exiled as the spell is cast. The exiled card is linked to the permanent the
// spell becomes (rule 607.2q), so it stays exiled for good if the spell is
// countered (the ruling), and a token exiled this way ceases to exist
// (111.7). The entering Elemental deals the damage — its power as it
// resolves, or as it last existed (608.2h) — and one that isn't a creature
// (a kindred permanent) has none to deal (the rulings).

const ENTER_TEXT = "Whenever another Elemental you control enters, it deals damage equal to its power to each opponent.";
const LEAVES_TEXT = "When this creature leaves the battlefield, return the exiled card to its owner's hand.";

export default defineCard({
  name: "Champion of the Path",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Sorcerer"],
  power: 7,
  toughness: 3,
  additionalCost: { behold: { filter: { subtype: "Elemental" }, text: "an Elemental", exile: true } },
  text: `As an additional cost to cast this spell, behold an Elemental and exile it. (Exile an Elemental you control or an Elemental card from your hand.)\n${ENTER_TEXT}\n${LEAVES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Elemental" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "damage",
        amount: { powerOf: "trigger-object" },
        who: "each-opponent",
        from: "trigger-object",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "hand" },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
