import { defineCard } from "../define.js";

// EDHREC rank 18622. Any damage by the creature it's attached to as the other
// one dies, whenever that damage was dealt (its rulings). A token, or a card
// gone from the graveyard, isn't exiled, so it makes no Zombie.

const STATIC_TEXT = "Equipped creature gets +3/+3 and has first strike.";
const DIES =
  "Whenever a creature dealt damage by equipped creature this turn dies, you may exile that card. If you do, create a 2/2 black Zombie creature token.";

export default defineCard({
  name: "Unscythe, Killer of Kings",
  manaCost: "{U}{B}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\n${DIES}\nEquip {2}`,
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
        filter: { type: "creature", damagedThisTurnBy: { source: "host" } },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile that card to create a 2/2 black Zombie creature token?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "trigger-object" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", atLeast: 1 },
              then: { kind: "create-token", token: "Zombie Token", count: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: DIES,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      grantKeywords: ["first-strike"],
      text: STATIC_TEXT,
    },
  ],
});
