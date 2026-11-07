import { defineCard } from "../define.js";

// Magic Origins. "Put all land cards from among them" is Muxus, Goblin
// Grandee's take-all `look-and-choose` (min and max the whole look); spell
// mastery untaps only the lands this put there (its ruling), as Hunting
// Wilds' kicker does, checked as it resolves — this spell is on the stack,
// not in the graveyard (its ruling).
export default defineCard({
  name: "Animist's Awakening",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text:
    "Reveal the top X cards of your library. Put all land cards from among them onto the battlefield tapped and the rest on the bottom of your library in a random order.\n" +
    "Spell mastery — If there are two or more instant and/or sorcery cards in your graveyard, untap those lands.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: "x",
        reveal: true,
        min: "x",
        max: "x",
        filter: { type: "land" },
        destination: "battlefield",
        enterTapped: true,
        leftover: "bottom-random",
      },
      {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { typesAnyOf: ["instant", "sorcery"] } },
        then: { kind: "untap-all", filter: { thisWay: "put-onto-battlefield" } },
      },
    ],
  },
});
