import { defineCard } from "../define.js";

// EDHREC rank 4159. The loss reaches the permanents opponents control as it
// resolves (rule 611.2c), in layer 6 at its timestamp (613.7): hexproof,
// indestructible and shroud as keywords, every instance of protection, and
// each ward ability the permanent had before then. One entering later, or
// gaining any of them afterwards, keeps it (the ruling). "A spell or ability
// you control" is Willbreaker's `byControllerOnly`; the last ability counts
// any bounty counter, whoever put it there, read as the creature last was.
//
// Rulings:
//   - Because damage remains marked on a creature until damage is removed as the turn
//     ends, damage previously dealt to a creature with indestructible may cause it to be destroyed
//     if Shay Cormac's first ability resolves later during that turn. This is notably not the case
//     with protection, as protection prevents damage.
//   - Shay Cormac's second ability resolves before the spell or ability that caused it
//     to trigger. It resolves even if that spell or ability is countered.
//   - If a permanent enters the battlefield under an opponent's control with hexproof,
//     indestructible, protection, shroud, and/or ward after Shay Cormac's first ability resolves,
//     it won't lose that ability until you activate Shay Cormac's first ability again. The same is
//     true if an opponent's permanent gains one of those abilities after Shay Cormac's first
//     ability resolves.
//   - Shay Cormac's last ability looks for any bounty counter on a creature, not just
//     one from that Shay Cormac.

const LOSE_TEXT =
  "{1}: Permanents your opponents control lose hexproof, indestructible, protection, shroud, and ward until end of turn.";
const BOUNTY_TEXT =
  "Whenever a creature an opponent controls becomes the target of a spell or ability you control, put a bounty counter on that creature.";
const DIES_TEXT = "Whenever a creature with a bounty counter on it dies, put two +1/+1 counters on Shay Cormac.";

export default defineCard({
  name: "Shay Cormac",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight", "Rogue"],
  power: 1,
  toughness: 1,
  text: `${LOSE_TEXT}\n${BOUNTY_TEXT}\n${DIES_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "become",
        filter: { controlledBy: "opponent" },
        loseKeywords: ["hexproof", "indestructible", "protection", "shroud", "ward"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: LOSE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "becomes-target",
        who: "any",
        filter: { type: "creature", controlledBy: "opponent" },
        byControllerOnly: true,
      },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "bounty", amount: 1 },
      resolve: null,
      text: BOUNTY_TEXT,
    },
    {
      trigger: {
        on: "dies",
        who: "any",
        filter: { type: "creature", counters: { kind: "bounty", compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
