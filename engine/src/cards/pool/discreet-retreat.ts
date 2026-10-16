import { defineCard } from "../define.js";

// EDHREC rank 11116.
//
// Outlaws are Assassins, Mercenaries, Pirates, Rogues and Warlocks. The mana
// pays for an outlaw spell or an ability of an outlaw **source** — a card in
// a hand or graveyard included (the ruling), so `abilityOfAnyZone`. The
// trigger counts outlaw spells only: "your first outlaw spell each turn" can
// be your third spell (`firstEachTurn` with a filter).
const OUTLAWS = ["Assassin", "Mercenary", "Pirate", "Rogue", "Warlock"];
const MANA_TEXT =
  "{T}: Add two mana of any one color. Spend this mana only to cast outlaw spells or activate abilities of outlaw sources.";
const GRANT_TEXT = `Enchanted land has "${MANA_TEXT}"`;
const CAST_TEXT = "Whenever you cast your first outlaw spell each turn, you draw a card and you lose 1 life.";

export default defineCard({
  name: "Discreet Retreat",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${GRANT_TEXT} (Assassins, Mercenaries, Pirates, Rogues, and Warlocks are outlaws.)\n${CAST_TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: {
            kind: "add-mana",
            mana: "any-color",
            amount: 2,
            spendOnly: {
              spell: { subtypes: OUTLAWS },
              abilityOf: { subtypes: OUTLAWS },
              abilityOfAnyZone: true,
              text: "Spend this mana only to cast outlaw spells or activate abilities of outlaw sources.",
            },
          },
          resolve: null,
          text: MANA_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtypes: OUTLAWS }, firstEachTurn: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
