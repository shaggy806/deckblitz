import { defineCard } from "../define.js";

// EDHREC rank 6772.
//
// Rulings:
//   Adéwalé's last ability triggers only if it's already in your graveyard as a Vehicle you
//     control deals combat damage to a player.
//   If Adéwalé leaves your graveyard before its last ability resolves, the ability will have no
//     effect, even if the card returns to your graveyard before that ability resolves.
//
// "Put an Assassin, Pirate, or Vehicle card" isn't optional: one is taken
// when one is there (`min` clamps to the cards that match), all six are
// revealed. The return works only from the graveyard (`fromGraveyard`, rule
// 113.6k — Squee's shape), once per Vehicle that deals combat damage, and
// `"source"` finds the card only if it's still that object (rule 400.7).
const LOOK_TEXT =
  "When Adéwalé enters, reveal the top six cards of your library. Put an Assassin, Pirate, or Vehicle card " +
  "from among them into your hand and the rest on the bottom of your library in a random order.";
const RETURN_TEXT =
  "Whenever a Vehicle you control deals combat damage to a player, you may return this card from your graveyard to your hand.";

export default defineCard({
  name: "Adéwalé, Breaker of Chains",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin", "Pirate"],
  power: 4,
  toughness: 1,
  text: `${LOOK_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 6,
        reveal: true,
        min: 1,
        max: 1,
        filter: { anyOf: [{ subtype: "Assassin" }, { subtype: "Pirate" }, { subtype: "Vehicle" }] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
    {
      fromGraveyard: true,
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { subtype: "Vehicle" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Adéwalé, Breaker of Chains from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
