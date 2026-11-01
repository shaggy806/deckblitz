import { defineCard } from "../define.js";

// EDHREC rank 3195. Both the anthem and the sacrifice cost read the type this
// enchantment chose (`ofChosenType`; the cost's filter is matched against
// the source). The indestructible may go to any creature you control, of the
// chosen type or not (the ruling).

const CHOOSE = "As this enchantment enters, choose a creature type.";
const ANTHEM = "Creatures you control of the chosen type get +1/+1.";
const TEXT =
  "{1}, Sacrifice a creature of the chosen type: Target creature you control gains indestructible until end of turn.";

export default defineCard({
  name: "Etchings of the Chosen",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  chooseCreatureTypeOnEnter: true,
  text: `${CHOOSE}\n${ANTHEM}\n${TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", ofChosenType: true } },
      grantPt: [1, 1],
      text: ANTHEM,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { type: "creature", ofChosenType: true } } },
      targets: ["creature-you-control"],
      effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
