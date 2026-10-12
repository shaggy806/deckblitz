import { defineCard } from "../define.js";

// EDHREC rank 15830.
//
// "Behold a Merfolk and exile it" is a mandatory additional cost (rule
// 701.4a): a Merfolk card from the hand or a Merfolk you control, exiled as
// the spell is cast. The exiled card is linked to the permanent the spell
// becomes (rule 607.2q), so it stays exiled for good if the spell is
// countered (the ruling), and a token exiled this way ceases to exist
// (111.7). "Enters or becomes tapped" is two triggers with one effect; "up
// to one target" may choose none.

const TAP_TEXT =
  "Whenever this creature enters or becomes tapped, tap up to one target creature and put a stun counter on it.";
const LEAVES_TEXT = "When this creature leaves the battlefield, return the exiled card to its owner's hand.";

const tapAndStun = {
  kind: "sequence",
  effects: [
    { kind: "tap", target: 0 },
    { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
  ],
} as const;

export default defineCard({
  name: "Champions of the Shoal",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 4,
  toughness: 6,
  additionalCost: { behold: { filter: { subtype: "Merfolk" }, text: "a Merfolk", exile: true } },
  text: `As an additional cost to cast this spell, behold a Merfolk and exile it. (Exile a Merfolk you control or a Merfolk card from your hand.)\n${TAP_TEXT}\n${LEAVES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: tapAndStun,
      resolve: null,
      text: TAP_TEXT,
    },
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: tapAndStun,
      resolve: null,
      text: TAP_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "hand" },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
