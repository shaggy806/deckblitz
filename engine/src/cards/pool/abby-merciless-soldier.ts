import { defineCard } from "../define.js";

// EDHREC rank 15527. The cast trigger counts the mana spent on Abby as a spell
// (its `manaSpent`, read as the trigger resolves); the tokens are its caster's.
// Abby herself then enters under an opponent its caster chooses (a
// replacement, as Xantcha's).
const CAST_TEXT =
  "When you cast this spell, create a number of 1/1 black Fungus Zombie creature tokens named Cordyceps Infected equal to the amount of mana spent to cast it.";
const ENTERS_TEXT = "Abby enters under the control of an opponent of your choice.";

export default defineCard({
  name: "Abby, Merciless Soldier",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Survivor"],
  power: 4,
  toughness: 4,
  pairing: { kind: "partner-group", group: "Survivors" },
  text: `${CAST_TEXT}\n${ENTERS_TEXT}\nPartner—Survivors (You can have two commanders if both have this ability.)`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "create-token", token: "Cordyceps Infected Token", count: { manaSpentOf: "source" } },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  choosePlayerOnEnter: "opponent",
  entersUnderChosenPlayer: true,
});
