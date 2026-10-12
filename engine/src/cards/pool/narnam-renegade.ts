import { defineCard } from "../define.js";
import { REVOLT_CONDITION } from "../helpers.js";

// EDHREC rank 10433.
//
// Rulings:
//   [2017-02-09] Revolt abilities don't care why the permanent left the battlefield, who caused it
//     to move, or where it moved to. They're equally satisfied by an artifact you sacrificed to
//     pay a cost, a creature you controlled that was destroyed by Murder, or an enchantment you
//     returned to your hand with Leave in the Dust.
//   [2017-02-09] Energy counters aren't permanents. Paying {E} won't satisfy a revolt ability.
//   [2017-02-09] Tokens that leave the battlefield will satisfy a revolt ability.
//   [2017-02-09] Revolt abilities check only whether a permanent you controlled left the
//     battlefield this turn or not. They don't apply multiple times if more than one permanent you
//     controlled left the battlefield. They don't check whether the permanent that left the
//     battlefield is still in the zone it moved to.
// An "enters with" replacement (rule 614.1c): the condition is read as it
// enters, and with none of it there it enters with no counters.

const ENTERS_TEXT =
  "Revolt — This creature enters with a +1/+1 counter on it if a permanent left the battlefield under your control this turn.";

export default defineCard({
  name: "Narnam Renegade",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 1,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${ENTERS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: REVOLT_CONDITION, then: 1, else: 0 } },
      },
      text: ENTERS_TEXT,
    },
  ],
});
