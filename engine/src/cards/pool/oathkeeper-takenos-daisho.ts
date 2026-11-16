import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 10957.
//
// "If it's a Samurai card" is no intervening if (rule 603.4 wants it right after the trigger
// condition): it's asked as the ability resolves, of the card in the graveyard (`object-matches`
// with `now` — the ruling), so a creature that was a Samurai only on the battlefield doesn't
// come back, and a Samurai card that has left the graveyard since is a new object (rule 400.7)
// the return can't find. The last ability exiles what Oathkeeper was attached to as it left, if
// that creature is still on the battlefield.
//
// Rulings:
//   Oathkeeper's second ability checks whether the card's creature type is Samurai, not whether
//     the creature was a Samurai when it left the battlefield.

const PUMP = "Equipped creature gets +3/+1.";
const RETURN =
  "Whenever equipped creature dies, return that card to the battlefield under your control if it's a Samurai card.";
const EXILE = "When Oathkeeper is put into a graveyard from the battlefield, exile equipped creature.";

export default defineCard({
  name: "Oathkeeper, Takeno's Daisho",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP}\n${RETURN}\n${EXILE}\nEquip {2}`,
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
  static: [{ affects: { scope: "attached" }, grantPt: [3, 1], text: PUMP }],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "object-matches", object: "trigger-object", filter: { subtype: "Samurai" }, now: true },
        then: { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true },
      },
      resolve: null,
      text: RETURN,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "exile", target: "attached" },
      resolve: null,
      text: EXILE,
    },
  ],
});
