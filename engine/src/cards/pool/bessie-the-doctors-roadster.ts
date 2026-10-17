import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 11164. Clammy Prowler's attack trigger, aimed at another
// legendary creature (attacking or not) rather than another attacker.
const ATTACK_TEXT = "Whenever Bessie attacks, another target legendary creature can't be blocked this turn.";

export default defineCard({
  name: "Bessie, the Doctor's Roadster",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste\n${ATTACK_TEXT}\n${crewText(2)}`,
  activated: [crew(2)],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", supertype: "legendary" } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
