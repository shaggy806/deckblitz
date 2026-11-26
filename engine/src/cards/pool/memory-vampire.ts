import { defineCard } from "../define.js";

// EDHREC rank 22076.
//
// Rulings:
//   You don't choose a target nonland card at the time Memory Vampire's last ability triggers.
//     Rather, a second "reflexive" ability triggers when you collect evidence 9 this way.
//   You don't have to choose any target players for Memory Vampire's last ability. In that
//     case, the ability will still resolve and you'll have the opportunity to collect evidence 9.
//   If you can't exile enough cards to meet or exceed the required mana value, you can't choose
//     to collect evidence at all.
//
// "That many" is the combat damage dealt (`triggerValue`). "Defending
// player" of a trigger on combat damage dealt to a player is that player:
// the reflexive ability keeps its creator's trigger player (rule 603.12), so
// its graveyard slot reads `whose: "trigger-player"`.

const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, any number of target players each mill that many cards. Then you may collect evidence 9. When you do, you may cast target nonland card from defending player's graveyard without paying its mana cost.";
const CAST_TEXT = "When you do, you may cast target nonland card from defending player's graveyard without paying its mana cost.";

export default defineCard({
  name: "Memory Vampire",
  manaCost: "{4}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Vampire", "Detective"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${DAMAGE_TEXT} (To collect evidence 9, exile cards with total mana value 9 or greater from your graveyard.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "any-number", of: "player" }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-target",
            from: 0,
            effect: { kind: "mill", target: 0, amount: { triggerValue: true } },
            simultaneous: true,
          },
          {
            kind: "collect-evidence",
            amount: 9,
            then: {
              kind: "reflexive-trigger",
              targets: [{ kind: "card-in-graveyard", whose: "trigger-player", filter: { notTypes: ["land"] } }],
              effect: { kind: "cast-now", target: 0, free: true },
              text: CAST_TEXT,
            },
          },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
