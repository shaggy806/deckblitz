import { defineCard } from "../define.js";

// Back face of The Rise of Sozin.
//
// Ruling: the triggered ability can target any combination of creature cards
// whose mana values total X or less, and any number with mana value 0.
//
// "You may pay {X}. When you do, …" is Electro, Assaulting Battery's `may`
// with an {X} cost feeding a reflexive trigger; the targets are Ancient Brass
// Dragon's group, bounded by that X and taken from the damaged player's
// graveyard.

const FIREBENDING_TEXT = "Menace, firebending 3 (Whenever this creature attacks, add {R}{R}{R}. This mana lasts until end of combat.)";
const DAMAGE_TEXT =
  "Whenever Fire Lord Sozin deals combat damage to a player, you may pay {X}. When you do, put any number of target creature cards with total mana value X or less from that player's graveyard onto the battlefield under your control.";

export default defineCard({
  name: "Fire Lord Sozin",
  art: "https://cards.scryfall.io/art_crop/back/1/4/14eadf46-90c2-4376-8183-6a922a60174d.jpg",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 5,
  toughness: 5,
  keywords: ["menace"],
  text: `${FIREBENDING_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 3, untilEndOfCombat: true },
      firebending: true,
      resolve: null,
      text: "Firebending 3",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X} to put creature cards with total mana value X or less from that player's graveyard onto the battlefield?",
        cost: "{X}",
        effect: {
          kind: "reflexive-trigger",
          targets: [
            {
              kind: "any-number",
              of: { kind: "card-in-graveyard", whose: "trigger-player", filter: { type: "creature" } },
              maxTotalManaValue: "x",
            },
          ],
          effect: {
            kind: "for-each-target",
            from: 0,
            simultaneous: true,
            effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
          },
          text: "When you do, put any number of target creature cards with total mana value X or less from that player's graveyard onto the battlefield under your control.",
        },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  faces: ["The Rise of Sozin", "Fire Lord Sozin"],
  transform: true,
});
