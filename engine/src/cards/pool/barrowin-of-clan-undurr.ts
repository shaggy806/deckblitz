import { defineCard } from "../define.js";

// EDHREC rank 10434. The attack trigger's "if you've completed a dungeon" ends
// the sentence, so it's checked only as the ability resolves (not an
// intervening-if, rule 603.4), and it counts a dungeon completed before
// Barrowin arrived (the ruling). "Up to one" and untargeted: the card is
// chosen as it resolves, and none may be.
const ENTER_TEXT = "When Barrowin enters, venture into the dungeon. (Enter the first room or advance to the next room.)";
const ATTACK_TEXT =
  "Whenever Barrowin attacks, return up to one creature card with mana value 3 or less from your graveyard to the battlefield if you've completed a dungeon.";

export default defineCard({
  name: "Barrowin of Clan Undurr",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Cleric"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "completed-dungeon" },
        then: {
          kind: "look-and-choose",
          zone: "graveyard",
          min: 0,
          max: 1,
          filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
          destination: "battlefield",
          leftover: "stay",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
