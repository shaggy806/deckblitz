import { defineCard } from "../define.js";

// EDHREC rank 6479.
// Rulings:
//   [2018-06-08] Once Loyal Unicorn's lieutenant ability has resolved while you control your
//     commander, its effects persist this turn even if you lose control of your commander or
//     Loyal Unicorn.
//   [2018-06-08] Loyal Unicorn's effect will prevent all combat damage that would be dealt to
//     creatures you control, even if those creatures weren't on the battlefield or weren't
//     creatures when the effect resolved.
//
// The prevention is a `damage-rule` whose recipient filter is asked as the
// damage would be dealt (rule 615.1); the vigilance grant is locked in as it
// resolves.

const TEXT =
  "Lieutenant — At the beginning of combat on your turn, if you control your commander, prevent all combat damage that would be dealt to creatures you control this turn. Other creatures you control gain vigilance until end of turn.";

export default defineCard({
  name: "Loyal Unicorn",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Unicorn"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "controls", filter: { isCommander: true, ownedBy: "you" }, atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage-rule", to: { permanents: { type: "creature", controlledBy: "you" } }, combat: true },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "vigilance",
            duration: "end-of-turn",
            exceptSource: true,
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
