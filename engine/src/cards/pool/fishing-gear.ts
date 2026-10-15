import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 9774. Final Fantasy.
//
// Rulings:
//   [2025-06-06] If you put an Aura onto the battlefield this way, you choose what it enchants as
//     it enters the battlefield. This doesn't target any permanent or player, but it must be able
//     to enchant that permanent or player. For example, you could put a green Aura onto the
//     battlefield enchanting a creature with hexproof controlled by an opponent, but not one with
//     protection from green.
//   [2025-06-06] You don't have to put the card on the battlefield even if it's a permanent card.
//     You may choose to leave it in exile and create a 1/1 blue Fish token.
//
// "That player's library" is the damaged player's: a `for-each-player` of
// `"trigger-player"` names them for the `reveal-until`, which exiles exactly
// their top card (an empty filter stops at the first) and hands it to `then`
// as target 0 — Aid from the Cowl's "if it's a permanent card, you may put it
// onto the battlefield", under your control, every other outcome ("if you
// don't") a Fish. The card left in exile stays there. With nothing to exile
// (an empty library) nothing was put onto the battlefield either, so that's a
// Fish too.
const DAMAGE_TEXT =
  "Whenever equipped creature deals combat damage to a player, exile the top card of that player's library. If it's a permanent card, you may put it onto the battlefield under your control. If you don't, create a 1/1 blue Fish creature token.";
const FISH = { kind: "create-token", token: "Fish Token", count: 1 } as const;

export default defineCard({
  name: "Fishing Gear",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${DAMAGE_TEXT}\nEquip {2}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "trigger-player",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "reveal-until",
              whose: "that-player",
              filter: {},
              exile: true,
              rest: "stay",
              then: {
                kind: "conditional",
                condition: {
                  kind: "target",
                  index: 0,
                  filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] },
                },
                then: {
                  kind: "may",
                  prompt: "Put the exiled card onto the battlefield under your control?",
                  effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
                  else: FISH,
                },
                else: FISH,
              },
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", atMost: 0 },
              then: FISH,
            },
          ],
        },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
