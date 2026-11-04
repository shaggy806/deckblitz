import { defineCard } from "../define.js";

// You make every choice, as this resolves, none of them a target. Everything is
// sacrificed at once (rule 603.10a), read then: a creature that shares a type
// with the chosen one stays, the chosen one always, even with no creature type
// to share. A player with no creatures has nothing chosen or to lose.
const TEXT =
  "For each player, you choose a creature that player controls. Then each player sacrifices all other creatures they control that don't share a creature type with the chosen creature they control.";

export default defineCard({
  name: "Winnowing",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  convoke: true,
  text: `Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\n${TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "vote",
        choose: true,
        who: "you",
        for: {
          permanent: { type: "creature" },
          about: "each-player",
          prompt: "Choose a creature: only what shares a creature type with it stays",
        },
      },
      {
        kind: "for-each-voted",
        which: "voted",
        simultaneous: true,
        effect: {
          kind: "sacrifice-all",
          who: { controllerOfTarget: 0 },
          filter: { type: "creature", not: { sharesCreatureTypeWith: 0 } },
        },
      },
    ],
  },
});
