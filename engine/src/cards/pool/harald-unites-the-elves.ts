import { defineCard } from "../define.js";

// EDHREC rank 12396.
// I's card may be one just milled or one already there (the ruling). II
// reaches the Elves you control as it resolves (the ruling). III is a
// delayed triggered ability for the rest of the turn (rule 603.7c) with a
// target of its own, chosen each time: any Elf you control that attacks
// this turn fires it, one you didn't control as III resolved included (the
// ruling), and it resolves before blockers are declared.
const CHAPTER_I = "I — Mill three cards. You may put an Elf or Tyvar card from your graveyard onto the battlefield.";
const CHAPTER_II = "II — Put a +1/+1 counter on each Elf you control.";
const CHAPTER_III_BODY =
  "Whenever an Elf you control attacks this turn, target creature an opponent controls gets -1/-1 until end of turn.";
const CHAPTER_III = `III — ${CHAPTER_III_BODY}`;

export default defineCard({
  name: "Harald Unites the Elves",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "battlefield",
            leftover: "stay",
            filter: { subtypes: ["Elf", "Tyvar"] },
          },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { subtype: "Elf", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "attacks", who: "you-control", filter: { subtype: "Elf" } },
          targets: ["creature-an-opponent-controls"],
        },
        effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
        text: CHAPTER_III_BODY,
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
