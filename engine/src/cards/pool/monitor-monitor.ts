import { defineCard } from "../define.js";

// EDHREC rank 14464.
//
// Rulings this follows: rolling several dice at once, one {1} rerolls any
// number of them; each Monitor Monitor is used once each turn, and several may
// be used on the same roll; the choice is made right after the roll, never
// later. A reroll modifies the roll's result (rule 706.2b — before any
// increase or decrease), so the roll still happens once, with the dice as
// rerolled. `rerollsRoll`. (Planechase's planar die isn't modelled.)
const OPEN = "When this creature enters, open an Attraction. (Put the top card of your Attraction deck onto the battlefield.)";
const REROLL = "Once each turn, you may pay {1} to reroll one or more dice you rolled.";

export default defineCard({
  name: "Monitor Monitor",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Employee"],
  power: 2,
  toughness: 5,
  text: `${OPEN}\n${REROLL}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "open-attraction" },
      resolve: null,
      text: OPEN,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      rerollsRoll: { pay: "{1}", oncePerTurn: true },
      text: REROLL,
    },
  ],
});
