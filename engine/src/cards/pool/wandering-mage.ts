import { defineCard } from "../define.js";

// Alliances (ALL). EDHREC rank 31228.
//
// Rulings:
//   The second ability checks that the targeted creature is a Cleric or Wizard only at the time
//     the ability is activated and at the time it resolves.
//   The -1/-1 counter is put on a creature you control as a cost, as you activate.
//
// The third cost is blight 1 under another name (rule 701.68a — Lethal
// Sting's additional cost): one -1/-1 counter on a creature you control,
// chosen as it's paid, payable only while you control one (701.68b).

const W_TEXT = "{W}, Pay 1 life: Prevent the next 2 damage that would be dealt to target creature this turn.";
const U_TEXT = "{U}: Prevent the next 1 damage that would be dealt to target Cleric or Wizard creature this turn.";
const B_TEXT =
  "{B}, Put a -1/-1 counter on a creature you control: Prevent the next 2 damage that would be dealt to target player or planeswalker this turn.";

export default defineCard({
  name: "Wandering Mage",
  manaCost: "{W}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric", "Wizard"],
  power: 0,
  toughness: 3,
  text: `${W_TEXT}\n${U_TEXT}\n${B_TEXT}`,
  activated: [
    {
      cost: { mana: "{W}", tap: false, payLife: 1 },
      targets: ["creature"],
      effect: { kind: "prevent-damage", target: 0, amount: 2 },
      resolve: null,
      text: W_TEXT,
    },
    {
      cost: { mana: "{U}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", subtypes: ["Cleric", "Wizard"] } }],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      text: U_TEXT,
    },
    {
      cost: { mana: "{B}", tap: false, blight: 1 },
      targets: ["player-or-planeswalker"],
      effect: { kind: "prevent-damage", target: 0, amount: 2 },
      resolve: null,
      text: B_TEXT,
    },
  ],
});
