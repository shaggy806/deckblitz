import { defineCard } from "../define.js";
import { powerUp } from "../helpers.js";

// EDHREC rank 17657. Marvel Super Heroes Commander.
//
// Boros Reckoner's trigger, but "any other target": never Black Panther
// himself. He deals the damage as he last existed if the damage killed him.
// Power-up is the helper (Brave Brawler), with Bolt Hound's "other creatures
// you control" pump after the counters.
const DAMAGE_TEXT = "Whenever Black Panther is dealt damage, he deals that much damage to any other target.";
const POWER_UP_TEXT =
  "Power-up — {5}{W}{W}: Put two +1/+1 counters on Black Panther. Other creatures you control get +2/+2 until end of turn. (Activate each power-up ability only once. Reduce the cost by his mana cost if he entered this turn.)";

export default defineCard({
  name: "Black Panther, Most Dangerous",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Hero"],
  power: 3,
  toughness: 3,
  text: `${DAMAGE_TEXT}\n${POWER_UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [{ kind: "other", of: "any-target" }],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [
    powerUp(
      "{5}{W}{W}",
      {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 2,
            toughness: 2,
            duration: "end-of-turn",
            exceptSource: true,
          },
        ],
      },
      POWER_UP_TEXT,
    ),
  ],
});
