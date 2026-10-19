import { defineCard } from "../define.js";

// EDHREC rank 10386.
//
// Rulings:
//   You may tap any untapped nontoken artifact to activate Meria's abilities, including artifact
//     creatures that entered the battlefield this turn, even if they don't have haste.
//   You must pay all costs and follow all timing restrictions for cards you play with Meria's last
//     ability. For example, you may only play a land card this way during a main phase of your own
//     turn, and only if you haven't yet played a land this turn.
//
// Neither cost has {T}, so tapping an artifact creature for it ignores summoning
// sickness (rule 302.6 covers only a creature's own {T}). Neither says
// "another", so Meria may tap herself if something has made her a nontoken
// artifact (`includeSelf`). Like Seton's, the mana ability is
// activated by hand rather than by the auto-payer (AUTHORING §15).
const MANA_TEXT = "Tap an untapped nontoken artifact you control: Add {G}.";
const IMPULSE_TEXT =
  "Tap two untapped nontoken artifacts you control: Exile the top card of your library. You may play it this turn.";

export default defineCard({
  name: "Meria, Scholar of Antiquity",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Artificer"],
  power: 3,
  toughness: 3,
  text: `${MANA_TEXT}\n${IMPULSE_TEXT}`,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 1, filter: { type: "artifact", token: false, controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 2, filter: { type: "artifact", token: false, controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: IMPULSE_TEXT,
    },
  ],
});
