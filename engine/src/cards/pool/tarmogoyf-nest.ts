import { defineCard } from "../define.js";

// EDHREC rank 8344. Modern Horizons 3 Commander.
//
// Rulings:
//   [2024-06-07] Kindred is a card type, counted by effects that count card types among cards in
//     a zone (Tarmogoyf's own count included).
//   [2024-06-07] The token is a copy of the card Tarmogoyf in the Oracle card reference.
//
// Squirrel Nest's enchant-land grant. The token is the shared "Tarmogoyf
// Token" (Disa the Restless's), a {1}{G} green Lhurgoyf with Tarmogoyf's
// characteristic-defining ability.
const GRANT_TEXT =
  'Enchanted land has "{1}{G}, {T}: Create a Tarmogoyf token." (It\'s a {1}{G} Lhurgoyf creature with "Tarmogoyf\'s power is equal to the number of card types among cards in all graveyards and its toughness is equal to that number plus 1.")';

export default defineCard({
  name: "Tarmogoyf Nest",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["kindred", "enchantment"],
  subtypes: ["Lhurgoyf", "Aura"],
  text: `Enchant land\n${GRANT_TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{1}{G}", tap: true },
          targets: [],
          effect: { kind: "create-token", token: "Tarmogoyf Token", count: 1 },
          resolve: null,
          text: "{1}{G}, {T}: Create a Tarmogoyf token.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
