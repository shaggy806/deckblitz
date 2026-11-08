import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 17919.
//
// Rulings:
//   [2022-04-29] Exiling the card with scavenge is part of the cost of activating the scavenge
//     ability. Once the ability is activated and the cost is paid, it's too late to stop the
//     ability from being activated by trying to remove the card from the graveyard.
//   [2022-04-29] The ability that defines Dodgy Jalopy's power works in all zones, not just on the
//     battlefield.
//   [2022-04-29] The number of counters given by Dodgy Jalopy's scavenge ability is its power as
//     it last existed in your graveyard before exiling it. Players can't change how many counters
//     it gives out after you've activated the ability by destroying the creature you control with
//     the highest mana value.

export default defineCard({
  name: "Dodgy Jalopy",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 0,
  toughness: 5,
  keywords: ["trample"],
  text: "Trample\nDodgy Jalopy's power is equal to the greatest mana value among creatures you control.\nCrew 3\nScavenge {2}{G} ({2}{G}, Exile this card from your graveyard: Put a number of +1/+1 counters equal to this card's power on target creature. Scavenge only as a sorcery.)",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 3, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "add-types",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      crew: true,
      text: "Crew 3",
    },
  ],
  // TODO(scaffold): P/T */5 isn't a plain number — a characteristic-defining ability, or an X
  // TODO(scaffold): Dodgy Jalopy's power is equal to the greatest mana value among creatures you control.
  // TODO(scaffold): Scavenge {2}{G}
});
