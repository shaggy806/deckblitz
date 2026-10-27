import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 27680. "Look at the top card" is a
// look with nothing to take (Covenant of Minds' `max: 0`); the reveal is
// Track Down's `reveal-top` over the revealed card; the granted trigger is
// Venomous Fangs' "deals damage to a creature, destroy that creature".

const LOOK_TEXT = "{1}: Look at the top card of your library.";
const REVEAL_TEXT =
  '{2}: Reveal the top card of your library. If it\'s a land card, this creature gains "Whenever this creature deals damage to a creature, destroy that creature" until end of turn. Activate only once each turn.';

export default defineCard({
  name: "Cruel Deceiver",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  text: `${LOOK_TEXT}\n${REVEAL_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "look-and-choose", zone: "library", count: 1, min: 0, max: 0, destination: "hand", leftover: "stay" },
      resolve: null,
      text: LOOK_TEXT,
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "reveal-top",
        then: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { type: "land" } },
          then: {
            kind: "grant-triggered",
            target: "source",
            duration: "end-of-turn",
            ability: {
              trigger: { on: "deals-damage", who: "self", to: "creature" },
              targets: [],
              effect: { kind: "destroy", target: "trigger-recipient" },
              resolve: null,
              text: "Whenever this creature deals damage to a creature, destroy that creature.",
            },
          },
        },
      },
      resolve: null,
      text: REVEAL_TEXT,
      oncePerTurn: true,
    },
  ],
});
