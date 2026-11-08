import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 28621. Vexing Arcanix's shape. With an empty library the player
// still names a card and nothing further happens (the ruling).
const TEXT =
  "{T}: Target player chooses a card name, then reveals the top card of their library. If that card has the chosen name, that player puts it into their hand. If it doesn't, the player puts it into their graveyard.";

export default defineCard({
  name: "Petra Sphinx",
  manaCost: "{2}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 3,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player"],
      effect: {
        kind: "choose-card-name",
        chooser: 0,
        then: {
          kind: "reveal-top",
          of: { ownerOf: 0 },
          then: {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { hasName: CHOSEN_CARD_NAME } },
            then: { kind: "return-to-hand", target: 0, from: "library" },
            else: { kind: "put-into-graveyard", target: 0 },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
