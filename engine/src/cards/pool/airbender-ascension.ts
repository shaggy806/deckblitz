import { defineCard } from "../define.js";

// EDHREC rank 2309.
//
// Rulings:
//   [2025-10-02] When the creature is exiled, Auras attached to the exiled creature will be put
//     into their owners' graveyards. Any Equipment will become unattached and remain on the
//     battlefield. Any counters on the exiled creature will cease to exist. When the card returns
//     to the battlefield, it will be a new object with no connection to the card that was exiled.
//   [2025-10-02] If a token is exiled by airbend or Airbender Ascension's last ability, it will
//     cease to exist and can't be cast or return to the battlefield.
//   (and the airbend rulings: its owner may cast the card from exile for {2} — an alternative
//   cost, X is 0, additional costs still paid; a land can't be played from there.)
//
// The end-step ability's "if" is an intervening one (rule 603.4): checked as
// it triggers and again as it resolves.
const ETB_TEXT = "When this enchantment enters, airbend up to one target creature.";
const QUEST_TEXT = "Whenever a creature you control enters, put a quest counter on this enchantment.";
const END_TEXT =
  "At the beginning of your end step, if this enchantment has four or more quest counters on it, exile up to " +
  "one target creature you control, then return it to the battlefield under its owner's control.";

export default defineCard({
  name: "Airbender Ascension",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text:
    `${ETB_TEXT} (Exile it. While it's exiled, its owner may cast it for {2} rather than its mana cost.)\n` +
    `${QUEST_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "exile", target: 0, airbend: true },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
      resolve: null,
      text: QUEST_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "self-counters", counter: "quest", compare: { op: "gte", n: 4 } },
      targets: [{ kind: "optional", of: "creature-you-control" }],
      effect: { kind: "flicker", target: 0 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
