import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

// EDHREC rank 8992.
//
// Kappa Tech-Wrecker's shape: offered only while it's on the battlefield with a
// menace counter to remove; "when you do" goes on the stack on its own (the
// ruling), and the player reveals their hand as that resolves.
const ENTER_TEXT = "This creature enters with a menace counter on it.";
const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, you may remove a menace counter from it. When you do, that player reveals their hand and you choose a nonland card from it. Exile that card.";

export default defineCard({
  name: "Biting-Palm Ninja",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Ninja"],
  power: 3,
  toughness: 3,
  text: `${ninjutsuText("{2}{B}")}\n${ENTER_TEXT}\n${DAMAGE_TEXT}`,
  activated: [ninjutsu("{2}{B}")],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "menace", amount: 1 } },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [{ kind: "source-on-battlefield" }, { kind: "self-counters", counter: "menace", compare: { op: "gte", n: 1 } }],
        },
        then: {
          kind: "may",
          prompt: "Remove a menace counter from Biting-Palm Ninja?",
          effect: { kind: "remove-counter", target: "source", counter: "menace", amount: 1 },
          then: {
            kind: "reflexive-trigger",
            targets: [],
            effect: {
              kind: "discard-chosen",
              target: "trigger-player",
              filter: { notTypes: ["land"] },
              destination: "exile",
              unlinked: true,
            },
            text: "When you do, that player reveals their hand and you choose a nonland card from it. Exile that card.",
          },
        },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
