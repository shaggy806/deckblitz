import { defineCard } from "../define.js";

// EDHREC rank 13585.
//
// "Behold a Goblin and exile it" is a mandatory additional cost (rule
// 701.4a): a Goblin card from the hand or a Goblin you control, exiled as the
// spell is cast. The exiled card is linked to the permanent the spell becomes
// (rule 607.2q), so it stays exiled for good if the spell is countered (the
// ruling), and a token exiled this way ceases to exist (111.7). "Blight 2" in
// the cost is the activator's own creature, chosen as it's paid — this one
// may be it — and needs one to put the counters on (701.68b); the opponent
// blights a creature of theirs as it resolves, and one with none does nothing.

const BLIGHT_TEXT = "Pay 1 life, Blight 2: Target opponent blights 2. Activate only as a sorcery.";
const LEAVES_TEXT = "When this creature leaves the battlefield, return the exiled card to its owner's hand.";

export default defineCard({
  name: "Champion of the Weird",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Berserker"],
  power: 5,
  toughness: 5,
  additionalCost: { behold: { filter: { subtype: "Goblin" }, text: "a Goblin", exile: true } },
  text: `As an additional cost to cast this spell, behold a Goblin and exile it. (Exile a Goblin you control or a Goblin card from your hand.)\n${BLIGHT_TEXT}\n${LEAVES_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 1, blight: 2 },
      targets: ["opponent"],
      effect: { kind: "blight", amount: 2, who: { target: 0 } },
      resolve: null,
      text: BLIGHT_TEXT,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "hand" },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
