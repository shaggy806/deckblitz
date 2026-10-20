import { defineCard } from "../define.js";

// EDHREC rank 8222.
//
// Rulings:
//   [2020-11-10] If an opponent lost life and subsequently lost the game, Belbe's triggered
//     ability still counts that player to determine how much mana to add.
//   [2020-11-10] If an opponent loses life before their own postcombat main phase, Belbe will
//     reward their suffering with mana.
//   [2020-11-10] If an effect creates an additional combat phase in a turn, it may also create an
//     additional main phase after that combat phase. Belbe's ability triggers at the beginning of
//     each of these postcombat main phases.
//
// Every player's postcombat main phase; the mana goes to the active player
// (`add-mana`'s `who`), counted over Belbe's controller's opponents — those who
// have since left the game included (`playersWithTurnStat` keeps them).

const TEXT =
  "At the beginning of each postcombat main phase, the active player adds {C}{C} for each of your opponents who lost life this turn.";

export default defineCard({
  name: "Belbe, Corrupted Observer",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie", "Elf"],
  power: 2,
  toughness: 2,
  text: `${TEXT} (Damage causes loss of life.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "postcombat-main", who: "any" },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: { product: [2, { playersWithTurnStat: "life-lost", who: "each-opponent" }] },
        who: "active-player",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
