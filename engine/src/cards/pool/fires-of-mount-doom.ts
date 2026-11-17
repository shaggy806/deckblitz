import { defineCard } from "../define.js";

// EDHREC rank 14017. LTR. "When you play a card this way" is the impulse
// exile's `whenCast` with `lands`: a delayed triggered ability of the effect
// (rule 603.7) that finds the card only when it's played under this
// permission (400.7h) — a land played this way (305.1) as well as a spell
// cast — its `"source"` this enchantment as it was then, so the damage is
// Fires of Mount Doom's even if it has left. Not played this turn, nothing
// triggers (the ruling).
//
// Rulings:
//   [2023-06-16] You pay all costs and follow all normal timing rules for a card played this way.
//     For example, if the exiled card is a land card, you may play it only during your main phase
//     while the stack is empty.
//   [2023-06-16] Fires of Mount Doom's first ability can target a creature that has no Equipment
//     attached to it.
//   [2023-06-16] If you activate Fires of Mount Doom's last ability but don't play the exiled card
//     this turn using that casting permission, Fires of Mount Doom won't deal damage to each
//     player.
//   [2023-06-16] If the target of Fires of Mount Doom's first ability is illegal by the time the
//     ability tries to resolve, it's removed from the stack. You won't destroy any Equipment.

const ENTERS_TEXT =
  "When Fires of Mount Doom enters, it deals 2 damage to target creature an opponent controls. Destroy all Equipment attached to that creature.";
const PLAYED_TEXT = "When you play a card this way, Fires of Mount Doom deals 2 damage to each player.";
const EXILE_TEXT = `{2}{R}: Exile the top card of your library. You may play that card this turn. ${PLAYED_TEXT}`;

export default defineCard({
  name: "Fires of Mount Doom",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${EXILE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, target: 0 },
          { kind: "destroy-all", filter: { subtype: "Equipment", attachedToObject: 0 } },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 1,
        duration: "end-of-turn",
        play: true,
        whenCast: {
          lands: true,
          effect: { kind: "damage", amount: 2, who: "each-player" },
          text: PLAYED_TEXT,
        },
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
