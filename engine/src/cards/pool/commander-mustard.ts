import { defineCard } from "../define.js";

// EDHREC rank 11784. Fallout (PIP).
//
// The activated ability grants the Soldiers there as it resolves (rule
// 611.2c); each activation is another instance, so two activations make an
// attacking Soldier deal 2 (the ruling). "It deals" — the Soldier is the
// source of the damage.
const STATIC_TEXT = "Other Soldiers you control have vigilance, trample, and haste.";
const GRANTED_TEXT = "Whenever this creature attacks, it deals 1 damage to defending player.";
const ACTIVATED_TEXT = `{2}{R}{W}: Until end of turn, Soldiers you control gain "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Commander Mustard",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance"],
  text: `Vigilance\n${STATIC_TEXT}\n${ACTIVATED_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Soldier", controlledBy: "you" }, excludeSelf: true },
      grantKeywords: ["vigilance", "trample", "haste"],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}{W}", tap: false },
      targets: [],
      effect: {
        kind: "grant-triggered-all",
        filter: { subtype: "Soldier", controlledBy: "you" },
        ability: {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: { kind: "damage", amount: 1, who: "trigger-player" },
          resolve: null,
          text: GRANTED_TEXT,
        },
        duration: "end-of-turn",
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
