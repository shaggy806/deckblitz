import { defineCard } from "../define.js";

// Dominaria (DOM). Top-1000 commander #742. EDHREC rank 11884.
//
// Rulings:
//   [2018-04-27] If a white instant or sorcery spell you don't control causes you to gain life,
//     Firesong and Sunspeaker's last ability triggers.
//   [2018-04-27] A spell causes you to gain life if its cost or effect instructs you to gain life
//     or if an instruction in its cost or effect is modified by a replacement effect and the
//     modified event includes you gaining life. If a spell's cost or effect instructs a source
//     with lifelink you control to deal damage, that spell causes that life gain as well.
//   [2018-04-27] If you gain an amount of life "for each" of something, that life is gained as one
//     event and Firesong and Sunspeaker's last ability triggers only once.
//   [2018-04-27] If a source you control with lifelink deals damage to you, you gain and lose that
//     much life simultaneously. Your life total doesn't change.
//   [2018-04-27] Firesong and Sunspeaker's last ability doesn't trigger if a triggered ability of
//     a white instant or sorcery spell or card causes you to gain life, such as the triggered
//     ability of Renewed Faith when it's cycled.
//   [2018-04-27] If a red and white spell you control deals damage and also instructs you to gain
//     life, Firesong and Sunspeaker's last ability triggers twice.
//   [2018-04-27] If a red and white spell you control deals damage to multiple things using the
//     word "deals" only once, Firesong and Sunspeaker's last ability triggers only once.
//     Similarly, if a red and white spell's effect causes it to deal damage to one thing and then
//     deal more damage with a second instance of the word "deals," Firesong and Sunspeaker's last
//     ability triggers twice, and so on.
//   [2023-04-14] The last ability of Firesong and Sunspeaker can't target a planeswalker or
//     battle.
//
// The gain a spell causes is one made as it resolves (`gains-life`'s `bySpell`): its effect's
// gain, lifelink damage its effect dealt (one gain per source, rule 119.9's batch), or an event
// a replacement turned into a gain; never a triggered ability, nor a mana ability activated to
// pay for something it asks. No instant or sorcery has a cost that gains life, so the rulings'
// "its cost" asks nothing more.

const LIFELINK_TEXT = "Red instant and sorcery spells you control have lifelink.";
const DAMAGE_TEXT =
  "Whenever a white instant or sorcery spell causes you to gain life, Firesong and Sunspeaker deals 3 damage to target creature or player.";

export default defineCard({
  name: "Firesong and Sunspeaker",
  manaCost: "{4}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Minotaur", "Cleric"],
  power: 4,
  toughness: 6,
  text: `${LIFELINK_TEXT}\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { typesAnyOf: ["instant", "sorcery"], colors: ["R"] }, keywords: ["lifelink"] },
      text: LIFELINK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "gains-life", who: "you", bySpell: { typesAnyOf: ["instant", "sorcery"], colors: ["W"] } },
      targets: ["creature-or-player"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
