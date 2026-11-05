import { defineCard } from "../define.js";

const UNTAP = "{T}: Untap all Forests and all green creatures. Activate only once each turn.";

export default defineCard({
  name: "Patron of the Orochi",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 7,
  toughness: 7,
  kicker: { cost: "", keyword: "offering", flash: true, offering: { subtype: "Snake" } },
  text: `Snake offering (You may cast this spell any time you could cast an instant by sacrificing a Snake and paying the difference in mana costs between this and the sacrificed Snake. Mana cost includes color.)\n${UNTAP}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "untap-all",
        filter: { anyOf: [{ subtype: "Forest" }, { type: "creature", colors: ["G"] }] },
      },
      resolve: null,
      text: UNTAP,
      oncePerTurn: true,
    },
  ],
});
