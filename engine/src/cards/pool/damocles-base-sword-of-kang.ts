import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 14899. Marvel Super Heroes Commander.
//
// A villainous choice (rule 701.55) asked of the player dealt the combat
// damage (`"trigger-player"`), as Dr. Eggman's: the option chosen is the
// Vehicle's controller's effect, about that player — "they sacrifice a
// nontoken creature of their choice" is theirs, "they lose 2 life and you
// draw two cards" the loss theirs and the draw yours. Either can be chosen
// even when it would do nothing (a player with no nontoken creature —
// rule 701.55b).
const COMBAT_TEXT =
  "Whenever Damocles Base deals combat damage to a player, that player faces a villainous choice — They sacrifice a nontoken creature of their choice, or they lose 2 life and you draw two cards.";

export default defineCard({
  name: "Damocles Base, Sword of Kang",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "deathtouch"],
  text: `Flying, deathtouch\n${COMBAT_TEXT}\nCrew 3`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "trigger-player",
        choices: [
          {
            text: "They sacrifice a nontoken creature of their choice.",
            effect: { kind: "sacrifice", who: "that-player", filter: { type: "creature", token: false }, count: 1 },
          },
          {
            text: "They lose 2 life and you draw two cards.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "lose-life", amount: 2, who: "that-player" },
                { kind: "draw", amount: 2 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  activated: [crew(3)],
});
