import { defineCard } from "../define.js";

// Reality Fracture (FRA). EDHREC rank 20961.

const DAMAGE_MODE = "Konstrari Charm deals 6 damage to target creature with flying.";
const COUNTERS_MODE = "Put two +1/+1 counters on target creature. It gains trample until end of turn.";
const MANA_MODE = "Add {C}{C}{C}.";

export default defineCard({
  name: "Konstrari Charm",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["instant"],
  text: `Choose one —\n• ${DAMAGE_MODE}\n• ${COUNTERS_MODE}\n• ${MANA_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DAMAGE_MODE,
        targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
        effect: { kind: "damage", amount: 6, target: 0 },
      },
      {
        text: COUNTERS_MODE,
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
            { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          ],
        },
      },
      {
        text: MANA_MODE,
        effect: { kind: "add-mana", mana: "C", amount: 3 },
      },
    ],
  },
});
