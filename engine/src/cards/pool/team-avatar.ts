import { defineCard } from "../define.js";

// EDHREC rank 9851. Thoughtweft Imbuer's attacks-alone trigger, X counted as
// it resolves (the ruling). The second ability is activated from the hand,
// discarding this card (Gideon's Memorial's channel shape); the damage is
// counted as it resolves, and the card deals it.
const ALONE_TEXT =
  "Whenever a creature you control attacks alone, it gets +X/+X until end of turn, where X is the number of creatures you control.";
const DISCARD_TEXT =
  "{2}{W}, Discard this card: It deals damage equal to the number of creatures you control to target creature.";
const YOUR_CREATURES = { countOf: { type: "creature", controlledBy: "you" } } as const;

export default defineCard({
  name: "Team Avatar",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ALONE_TEXT}\n${DISCARD_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: YOUR_CREATURES,
        toughness: YOUR_CREATURES,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ALONE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: YOUR_CREATURES },
      resolve: null,
      zone: "hand",
      text: DISCARD_TEXT,
    },
  ],
});
