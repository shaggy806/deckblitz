import { defineCard } from "../define.js";

// EDHREC rank 23654. It becomes tapped however it's tapped — attacking, a
// cost, an opponent's tap effect (rule 701.26a). "Another target Merfolk you
// control" is any Merfolk permanent of yours but this one (Deeproot Elite's
// filter).

const TEXT = "Whenever this creature becomes tapped, another target Merfolk you control gets +2/+0 until end of turn.";

export default defineCard({
  name: "Tributary Vaulter",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Merfolk", "Warrior"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { subtype: "Merfolk", controlledBy: "you" } } }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
