import { defineCard } from "../define.js";

// EDHREC rank 5218.
//
// Rulings:
//   [2023-10-13] As the activated ability resolves, it creates a continuous effect that won't
//     begin to apply until the targeted player starts casting a spell this turn. It applies to
//     that spell and the timestamp of that effect is the time that the spell was put on the stack.
//
// The whole ability is done by the target player: the mana is theirs (the
// colour their choice) and the next spell with cascade is the next one they
// cast. It has a target, so it isn't a mana ability (rule 605.1a).
const CASCADE = {
  trigger: { on: "this-cast" },
  targets: [],
  effect: { kind: "cascade" },
  resolve: null,
  text: "Cascade",
} as const;

const GRANTED_TEXT = "{T}: Target player adds two mana of any one color. The next spell they cast this turn has cascade.";

export default defineCard({
  name: "Bigger on the Inside",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact or land\nEnchanted permanent has "${GRANTED_TEXT}" (When they cast their next spell, they exile cards from the top of their library until they exile a nonland card that costs less. They may cast it without paying its mana cost. They put the exiled cards on the bottom in a random order.)`,
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "land"] } }],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["player"],
          effect: {
            kind: "as-player",
            who: { target: 0 },
            effect: {
              kind: "sequence",
              effects: [
                { kind: "add-mana", mana: "any-color", amount: 2 },
                { kind: "grant-spells-this-turn", next: true, triggered: [CASCADE] },
              ],
            },
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `Enchanted permanent has "${GRANTED_TEXT}"`,
    },
  ],
});
