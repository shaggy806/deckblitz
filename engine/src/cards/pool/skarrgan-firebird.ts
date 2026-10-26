import { defineCard } from "../define.js";

// EDHREC rank 19309.
//
// Rulings:
//   [2006-02-01] You can activate Skarrgan Firebird's last ability if an opponent was dealt damage
//     by any source, even if you didn't control that source.
//
// Bloodthirst 3 (rule 702.54a): an enters-with-counters replacement, read as
// it enters, on whether any one opponent was dealt damage this turn (Bloodrage
// Vampire). The graveyard ability asks the same turn stat.
const BLOODTHIRST =
  "Bloodthirst 3 (If an opponent was dealt damage this turn, this creature enters with three +1/+1 counters on it.)";
const RETURN_TEXT =
  "{R}{R}{R}: Return this card from your graveyard to your hand. Activate only if an opponent was dealt damage this turn.";

export default defineCard({
  name: "Skarrgan Firebird",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `${BLOODTHIRST}\nFlying\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "turn-stat", stat: "damage-taken", who: "opponent", atLeast: 1 },
            then: 3,
            else: 0,
          },
        },
      },
      text: BLOODTHIRST,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}{R}{R}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      condition: { kind: "turn-stat", stat: "damage-taken", who: "opponent", atLeast: 1 },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
