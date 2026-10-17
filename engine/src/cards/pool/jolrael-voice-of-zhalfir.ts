import { defineCard } from "../define.js";

// EDHREC rank 10872. March of the Machine: The Aftermath.
//
// Rulings:
//   [2023-05-12] Jolrael's last ability applies to any land creature you control that deals combat
//     damage to a player, not only lands that become land creatures because of Jolrael's first
//     ability.
//   [2023-05-12] Use the number of cards in your hand as Jolrael's first ability resolves to
//     determine the value of X. Once the ability resolves, that value is locked in. The power and
//     toughness of the land creature won't change if the number of cards in your hand changes
//     later in the turn.
//
// `animate` reads a live amount once, as it applies (rule 608.2h), which is
// the second ruling's lock-in. Restless Anchorage's shape for the Bird, on a
// chosen land rather than itself; the draw trigger is any land creature you
// control (the first ruling).
const COMBAT_TEXT =
  "At the beginning of combat on your turn, up to one target land you control becomes an X/X green and blue Bird creature with flying and haste until end of turn, where X is the number of cards in your hand. It's still a land.";
const DRAW_TEXT = "Whenever a land creature you control deals combat damage to a player, draw a card.";

export default defineCard({
  name: "Jolrael, Voice of Zhalfir",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 3,
  toughness: 3,
  text: `${COMBAT_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: "land-you-control" }],
      effect: {
        kind: "animate",
        target: 0,
        power: { cardsInHand: "you" },
        toughness: { cardsInHand: "you" },
        addTypes: ["creature"],
        addSubtypes: ["Bird"],
        setColors: ["G", "U"],
        keywords: ["flying", "haste"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        filter: { types: ["land", "creature"] },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
