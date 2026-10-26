import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 28292.
//
// Bloodthirst X (rule 702.54c): X is the total damage this creature's
// controller's opponents have been dealt this turn — the `damage-taken` turn
// stat summed over each opponent, read as it enters.
//
// Rulings:
//   [2006-02-01] Protection from instants works only while Petrified Wood-Kin is on the
//     battlefield. It can be targeted by instant spells or abilities of instant cards while it's
//     on the stack or in any other zone but on the battlefield.
//   [2006-02-01] "Protection from instants" means instant spells can't target it, damage that
//     would be dealt to it by instant sources is prevented, and it can't be the target of
//     abilities of instants (such as Haunt).

const BLOODTHIRST =
  "Bloodthirst X (This creature enters with X +1/+1 counters on it, where X is the damage dealt to your opponents this turn.)";

export default defineCard({
  name: "Petrified Wood-Kin",
  manaCost: "{6}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental", "Warrior"],
  power: 3,
  toughness: 3,
  cantBeCountered: true,
  text: `This spell can't be countered.\n${BLOODTHIRST}\nProtection from instants`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { turnStat: "damage-taken", who: "each-opponent" } },
      },
      text: BLOODTHIRST,
    },
    { affects: { scope: "self" }, protection: { types: ["instant"] }, text: "Protection from instants" },
  ],
});
