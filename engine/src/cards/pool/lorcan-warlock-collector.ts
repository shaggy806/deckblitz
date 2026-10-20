import { defineCard } from "../define.js";

// EDHREC rank 12255. The trigger reads the card as it is in the graveyard (its ruling — an
// adventurer creature card countered counts, a dying animated land doesn't), and the
// replacement covers every Warlock you control, not only collected ones (its other ruling).
export default defineCard({
  name: "Lorcan, Warlock Collector",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: "Flying\nWhenever a creature card is put into an opponent's graveyard from anywhere, you may pay life equal to its mana value. If you do, put it onto the battlefield under your control. It's a Warlock in addition to its other types.\nIf a Warlock you control would die, exile it instead.",
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "opponent", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay life equal to its mana value to put it onto the battlefield under your control?",
        costLife: { manaValueOf: "trigger-object" },
        effect: {
          kind: "put-onto-battlefield",
          target: "trigger-object",
          underYourControl: true,
          addSubtypes: ["Warlock"],
        },
      },
      resolve: null,
      text: "Whenever a creature card is put into an opponent's graveyard from anywhere, you may pay life equal to its mana value. If you do, put it onto the battlefield under your control. It's a Warlock in addition to its other types.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        from: "battlefield",
        filter: { type: "creature", subtype: "Warlock", controlledBy: "you" },
      },
      text: "If a Warlock you control would die, exile it instead.",
    },
  ],
});
