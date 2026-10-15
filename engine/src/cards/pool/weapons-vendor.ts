import { defineCard } from "../define.js";

// EDHREC rank 7742.
//
// Rulings:
//   [2025-06-06] You don't choose targets for Weapons Vendor's last ability at the time it
//     triggers. Rather, a second "reflexive" ability triggers when you pay {1} this way. You
//     choose targets for that ability as it goes on the stack. Each player may respond to this
//     triggered ability as normal.
//
// "If you control an Equipment" is an intervening if (rule 603.4): the
// trigger's `condition`, checked as it triggers and as it resolves. The pay is
// a `may` with a cost; paying it creates the reflexive trigger (rule 603.12),
// whose targets are chosen then.

const ETB_TEXT = "When this creature enters, draw a card.";
const ATTACH_TEXT = "When you do, attach target Equipment you control to target creature you control.";
const COMBAT_TEXT = `At the beginning of combat on your turn, if you control an Equipment, you may pay {1}. ${ATTACH_TEXT}`;

export default defineCard({
  name: "Weapons Vendor",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 2,
  text: `${ETB_TEXT}\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "controls", filter: { subtype: "Equipment", controlledBy: "you" }, atLeast: 1 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to attach an Equipment you control to a creature you control?",
        cost: "{1}",
        effect: {
          kind: "reflexive-trigger",
          targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Equipment" } }, "creature-you-control"],
          effect: { kind: "attach", target: 1, attachment: 0 },
          text: ATTACH_TEXT,
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
