import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Top-5000 #3516. "Is a black Zombie" overrides its colours and creature types
// (the rulings), only while attached. It may return a card it can't equip, and
// then stays as it was (the ruling).
const STATIC_TEXT =
  "Equipped creature gets +2/+2, has intimidate, and is a black Zombie. (A creature with intimidate can't be blocked except by artifact creatures and/or creatures that share a color with it.)";
const RETURN_TEXT =
  "Whenever a nontoken creature is put into your graveyard from the battlefield, you may pay {4}. If you do, return that card to the battlefield and attach this Equipment to it.";

export default defineCard({
  name: "Nim Deathmantle",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\n${RETURN_TEXT}\nEquip {4}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["intimidate"],
      setColors: ["B"],
      setSubtypes: ["Zombie"],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", ownedBy: "you", token: false } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {4} to return that card to the battlefield and attach Nim Deathmantle to it?",
        cost: "{4}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "put-onto-battlefield", target: "trigger-object" },
            { kind: "attach", target: "put-this-way" },
          ],
        },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
  activated: [equip("{4}")],
});
