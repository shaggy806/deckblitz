import { defineCard } from "../define.js";

// EDHREC rank 1186.
//
// Vat of Rebirth's trigger, from anyone's side: "another" is other than the
// Soulcleaver itself. The equipped creature dying unattaches it, so its own
// death puts a counter on nothing.

const DIES =
  "Whenever another artifact or creature is put into a graveyard from the battlefield, put a +1/+1 counter on equipped creature.";

export default defineCard({
  name: "Tarrian's Soulcleaver",
  manaCost: "{1}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature has vigilance.\n${DIES}\nEquip {2}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "any",
        filter: { typesAnyOf: ["artifact", "creature"] },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DIES,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["vigilance"],
      text: "Equipped creature has vigilance.",
    },
  ],
});
