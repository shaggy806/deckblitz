import { defineCard } from "../define.js";

// EDHREC rank 11949.
//
// Rulings:
//   If an effect allows you to cast a spell that has escalate without paying its mana cost, you
//     pay escalate costs for that spell if you choose more than one mode.
//   You choose all of your modes at once. You can't choose any one mode multiple times.
//   If one target of an escalate spell becomes illegal, the other targets will still be
//     affected.
//
// Escalate's discard is `castModal.alsoPerExtraMode` (rule 702.120a): a card
// for each mode beyond the first, chosen as the cost is paid (601.2h).

export default defineCard({
  name: "Collective Brutality",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Escalate—Discard a card. (Pay this cost for each mode chosen beyond the first.)\n" +
    "Choose one or more —\n" +
    "• Target opponent reveals their hand. You choose an instant or sorcery card from it. That player discards that card.\n" +
    "• Target creature gets -2/-2 until end of turn.\n" +
    "• Target opponent loses 2 life and you gain 2 life.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 3,
    alsoPerExtraMode: { text: "Discard a card", discard: 1 },
    modes: [
      {
        text: "Target opponent reveals their hand. You choose an instant or sorcery card from it. That player discards that card.",
        targets: ["opponent"],
        effect: { kind: "discard-chosen", target: 0, filter: { typesAnyOf: ["instant", "sorcery"] } },
      },
      {
        text: "Target creature gets -2/-2 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      },
      {
        text: "Target opponent loses 2 life and you gain 2 life.",
        targets: ["opponent"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "lose-life", amount: 2, target: 0 },
            { kind: "gain-life", amount: 2 },
          ],
        },
      },
    ],
  },
});
