import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 7231. Ring of Xathrid's blue twin: "if it's blue" is checked as
// the upkeep ability resolves (it ends the sentence — not an intervening if),
// of the creature equipped then.
const HEXPROOF =
  "{2}: Equipped creature gains hexproof until end of turn. (It can't be the target of spells or abilities your opponents control.)";
const UPKEEP = "At the beginning of your upkeep, put a +1/+1 counter on equipped creature if it's blue.";

export default defineCard({
  name: "Ring of Evos Isle",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${HEXPROOF}\n${UPKEEP}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "attached", keyword: "hexproof", duration: "end-of-turn" },
      resolve: null,
      text: "{2}: Equipped creature gains hexproof until end of turn.",
    },
    equip("{1}"),
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { attachedTo: { colors: ["U"] } } },
        then: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
