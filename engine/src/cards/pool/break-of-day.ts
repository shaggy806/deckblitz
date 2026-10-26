import { defineCard } from "../define.js";

// "Those creatures" are the creatures you control as it resolves — the same
// set the pump reads, since nothing changes control between the two steps.
// Life is checked once, on resolution (the ruling).
export default defineCard({
  name: "Break of Day",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Creatures you control get +1/+1 until end of turn.\nFateful hour — If you have 5 or less life, those creatures gain indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy them.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      {
        kind: "conditional",
        condition: { kind: "life-total", who: "you", atMost: 5 },
        then: {
          kind: "grant-keyword-all",
          filter: { type: "creature", controlledBy: "you" },
          keyword: "indestructible",
          duration: "end-of-turn",
        },
      },
    ],
  },
});
