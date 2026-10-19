import { defineCard } from "../define.js";

// EDHREC rank 7836.
//
// Rulings:
//   [2022-10-14] If Mishra's Foundry is already a creature, activating the second ability will
//     override any previous effects that set its power and/or toughness to specific values.
//     Other effects that are affecting its power and/or toughness, including +1/+1 counters and
//     the effects of spells like Giant Growth, will continue to apply.
//   [2022-10-14] If Mishra's Foundry becomes a creature and you haven't controlled it
//     continuously since the beginning of your most recent turn, you won't be able to activate
//     its first or last abilities, and it won't be able to attack (unless it somehow gains haste).
//
// Mishra's Factory's animation (a layer-7b set, later ones overriding it; the
// summoning-sickness rule for {T} abilities applies to it as a creature).

const MANA_TEXT = "{T}: Add {C}.";
const ANIMATE_TEXT = "{2}: This land becomes a 2/2 Assembly-Worker artifact creature until end of turn. It's still a land.";
const PUMP_TEXT = "{1}, {T}: Target attacking Assembly-Worker gets +2/+2 until end of turn.";

export default defineCard({
  name: "Mishra's Foundry",
  colors: [],
  types: ["land"],
  text: `${MANA_TEXT}\n${ANIMATE_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 2,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Assembly-Worker"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Assembly-Worker", attacking: true } }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
