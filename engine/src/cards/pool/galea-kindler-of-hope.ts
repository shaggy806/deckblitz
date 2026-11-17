import { defineCard } from "../define.js";

// EDHREC rank 12930. "You may cast Aura and Equipment spells from the top of
// your library" is a static `mayPlay` from the library's top (spells only; a
// land stays where it is, rule 305.9). "When you cast an Equipment spell this
// way" is a cast trigger, not a rider on the permission: a `plays-card`
// trigger narrowed to a spell cast under this permanent's own permission in
// its present stint (`underThis`) — one cast from the top through another
// permission (Mystic Forge's) is not cast "this way". As it resolves, the
// spell gains the ability, and the permanent it becomes keeps it (rule
// 400.7a; a countered spell or one gone from the stack gains nothing). The
// rulings: all costs are still paid (alternative costs may be), and the
// timing of the spells cast this way is unchanged.

const LOOK = "You may look at the top card of your library any time.";
const CAST = "You may cast Aura and Equipment spells from the top of your library.";
const ATTACH = "When this Equipment enters, attach it to target creature you control.";
const GAINS = `When you cast an Equipment spell this way, it gains "${ATTACH}"`;

export default defineCard({
  name: "Galea, Kindler of Hope",
  manaCost: "{1}{G}{W}{U}",
  colors: ["G", "W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Knight"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${LOOK}\n${CAST} ${GAINS}`,
  static: [
    { affects: { scope: "self" }, visibility: { looksAtOwnLibraryTop: true }, text: LOOK },
    {
      affects: { scope: "self" },
      mayPlay: { from: "library-top", filter: { anyOf: [{ subtype: "Aura" }, { subtype: "Equipment" }] } },
      text: CAST,
    },
  ],
  triggered: [
    {
      trigger: { on: "plays-card", who: "you", underThis: true, filter: { subtype: "Equipment" } },
      targets: [],
      effect: {
        kind: "grant-triggered",
        target: "trigger-object",
        duration: "permanent",
        ability: {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: ["creature-you-control"],
          effect: { kind: "attach", target: 0, attachment: "source" },
          resolve: null,
          text: ATTACH,
        },
      },
      resolve: null,
      text: GAINS,
    },
  ],
});
