import { defineCard } from "../define.js";
import { firebending } from "../helpers.js";

// EDHREC rank 7257. Both exiles are the opponent's own choices as the trigger
// resolves, the graveyard card after the creature has left, and both cards are
// exiled with Azula (rule 607.2a). The permission is hers alone: during her
// controller's turn, any time they have priority (`flash`, rule 601.3c), every
// cost still paid (its rulings), with mana of any type (rule 609.4b).

const FIREBENDING_TEXT = "Firebending 2 (Whenever this creature attacks, add {R}{R}. This mana lasts until end of combat.)";
const EXILE_TEXT =
  "When Azula enters, target opponent exiles a nontoken creature they control, then they exile a nonland card from their graveyard.";
const CAST_TEXT =
  "During your turn, you may cast cards exiled with Azula and you may cast them as though they had flash. Mana of any type can be spent to cast those spells.";

export default defineCard({
  name: "Azula, Cunning Usurper",
  manaCost: "{2}{U}{B}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Rogue"],
  power: 4,
  toughness: 4,
  text: `${FIREBENDING_TEXT}\n${EXILE_TEXT}\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      mayPlay: { from: "exile", filter: {}, linked: true, yourTurnOnly: true, flash: true, spendAs: "any-type" },
      text: CAST_TEXT,
    },
  ],
  triggered: [
    firebending(2, FIREBENDING_TEXT),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "vote",
            choose: true,
            who: { target: 0 },
            for: { permanent: { type: "creature", controlledBy: "you", token: false }, own: true },
          },
          { kind: "for-each-voted", which: "voted", effect: { kind: "exile", target: 0, linked: true } },
          {
            kind: "for-each-player",
            who: { target: 0 },
            effect: {
              kind: "look-and-choose",
              player: "that-player",
              zone: "graveyard",
              filter: { notTypes: ["land"] },
              min: 1,
              max: 1,
              destination: "exile",
              leftover: "stay",
            },
          },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
