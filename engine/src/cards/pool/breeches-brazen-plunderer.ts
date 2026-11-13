import { defineCard } from "../define.js";

// EDHREC rank 4802.
//
// Rulings:
//   If you don't play one of the exiled cards, it remains exiled. It won't be available to be
//     played on future turns.
//   In a multiplayer game, if a player leaves the game, all cards that player owns leave as well.
//     If you leave the game, any spells and/or permanents you control from Breeches's brazen
//     thievery are exiled.
//   You must follow the normal timing permissions and restrictions for each exiled card. If one
//     is a land, you can't play it unless you have land plays available.
//   You'll exile a card from each opponent who was dealt damage, not from all of your opponents.
//   You'll still pay all costs for a spell cast this way, including additional costs. You may
//     also pay alternative costs if any are available.
//   (Partner's rulings: two commanders, each tracked separately.)

const TRIGGER_TEXT =
  "Whenever one or more Pirates you control deal damage to your opponents, exile the top card of each of those opponents' libraries. You may play those cards this turn, and you may spend mana as though it were mana of any color to cast those spells.";

export default defineCard({
  name: "Breeches, Brazen Plunderer",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Pirate"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  pairing: { kind: "partner" },
  text: `Menace\n${TRIGGER_TEXT}\nPartner (You can have two commanders if both have partner.)`,
  triggered: [
    {
      // One trigger for the whole damage event, however many opponents it
      // hit (rule 603.2c); "those opponents" are the ones dealt damage.
      trigger: {
        on: "deals-damage-batch",
        who: "you-control",
        filter: { subtype: "Pirate" },
        to: "opponent",
        once: "per-event",
      },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 1,
        whose: "damaged-players",
        duration: "end-of-turn",
        spendAs: "any-color",
        play: true,
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
