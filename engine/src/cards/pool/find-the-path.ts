import { defineCard } from "../define.js";

// EDHREC rank 16166.
const ENTER_TEXT = "When this Aura enters, venture into the dungeon. (Enter the first room or advance to the next room.)";
const GRANT_TEXT = 'Enchanted land has "{T}: Add {G}{G}."';

export default defineCard({
  name: "Find the Path",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${ENTER_TEXT}\n${GRANT_TEXT}`,
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "add-mana", mana: "G", amount: 2 },
          resolve: null,
          text: "{T}: Add {G}{G}.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
