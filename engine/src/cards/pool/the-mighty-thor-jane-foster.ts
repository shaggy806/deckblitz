import { defineCard } from "../define.js";

// EDHREC rank 11228. Marvel Super Heroes.

const ATTACK_TEXT =
  "Whenever The Mighty Thor attacks, exile up to one target nontoken artifact or creature, then return that card to the battlefield tapped under its owner's control.";
const EQUIPMENT_TEXT = "Whenever an Equipment you control enters, draw a card.";

export default defineCard({
  name: "The Mighty Thor, Jane Foster",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "God", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}\n${EQUIPMENT_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"], token: false } },
        },
      ],
      effect: { kind: "flicker", target: 0, tapped: true },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Equipment" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: EQUIPMENT_TEXT,
    },
  ],
});
