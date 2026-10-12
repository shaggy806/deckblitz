import { defineCard } from "../define.js";

// EDHREC rank 6408.
//
// Rulings:
//   [2025-10-02] The third ability of Aang's Iceberg allows you to sacrifice Aang's Iceberg as the
//     ability resolves, not as a cost to activate the ability. If Aang's Iceberg leaves the
//     battlefield before the activated ability resolves, you will be unable to sacrifice Aang's
//     Iceberg and will not scry, even if Aang's Iceberg was sacrificed via a different ability
//     while its activated ability was on the stack.
//   [2025-10-02] If Aang's Iceberg leaves the battlefield before its triggered ability resolves,
//     including if it is sacrificed by its activated ability, the target permanent won't be
//     exiled.
//   [2025-10-02] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.
//
// Banishing Light's O-Ring (rule 610.3: nothing is exiled once the
// enchantment has left), on any other nonland permanent. The waterbend ability
// sacrifices it as it resolves (`sacrifice-source`'s "if you do").

const ENTER_TEXT =
  "When this enchantment enters, exile up to one other target nonland permanent until this enchantment leaves the battlefield.";
const BEND_TEXT =
  "Waterbend {3}: Sacrifice this enchantment. If you do, scry 2. (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)";

export default defineCard({
  name: "Aang's Iceberg",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}\n${BEND_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "nonland-permanent" } }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this enchantment leaves the battlefield, return the exiled card.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false, waterbend: true },
      targets: [],
      effect: { kind: "sacrifice-source", then: { kind: "scry", amount: 2 } },
      resolve: null,
      text: "Waterbend {3}: Sacrifice this enchantment. If you do, scry 2.",
    },
  ],
});
