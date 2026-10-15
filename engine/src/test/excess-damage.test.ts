/**
 * "The excess damage dealt this way" (rule 120.4a): damage to a creature past
 * lethal damage — its toughness less damage already marked, or 1 from a
 * deathtouch source — and to a planeswalker past its loyalty. The
 * `excessDamageThisWay` amount and the `excess-damage-this-way` condition read
 * it off the resolution's own damage.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, grant, lands, life, named, ref, settle, spawn, table, toHand, zone } from "./harness.js";

const treasures = (game: ReturnType<typeof table>["game"]) => named(game, "Treasure Token", A);

describe("excess damage dealt this way", () => {
  it("Hell to Pay makes a tapped Treasure for each point past lethal", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const bears = spawn(game, "Grizzly Bears", B); // 2/2
    cast(game, toHand(game, "Hell to Pay"), { targets: [ref(bears)], x: 5 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(treasures(game)).toHaveLength(3);
    expect(treasures(game).every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("damage already marked counts toward lethal, and exactly lethal is no excess", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    const ogre = spawn(game, "Gray Ogre", B); // 2/2
    game.state.objects[ogre].damageMarked = 1;
    cast(game, toHand(game, "Hell to Pay"), { targets: [ref(ogre)], x: 3 });
    // Lethal was 1 more, so 2 of the 3 were excess.
    expect(treasures(game)).toHaveLength(2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Hell to Pay"), { targets: [ref(bears)], x: 2 });
    expect(treasures(game)).toHaveLength(2);
  });

  it("from a deathtouch source, anything past 1 is excess", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const wurm = spawn(game, "Craw Wurm"); // 6/4
    grant(game, wurm, "deathtouch");
    const wall = spawn(game, "Wall of Wood", B); // 0/3
    cast(game, toHand(game, "Windswift Slice"), { targets: [ref(wurm), ref(wall)] });
    expect(named(game, "Elf Warrior Token", A)).toHaveLength(5);
  });

  it("a planeswalker's is what's past its loyalty", () => {
    const { game } = table();
    const walker = spawn(game, "Jace Beleren", B);
    game.state.objects[walker].counters.loyalty = 3;
    const before = life(game, A);
    game.debugApplyEffect(
      A,
      {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 5, target: 0 },
          { kind: "gain-life", amount: { excessDamageThisWay: true } },
        ],
      },
      [ref(walker)],
    );
    settle(game);
    expect(life(game, A)).toBe(before + 2);
  });

  it("Rhino's Rampage counts only the excess dealt to the opponent's creature", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const relic = spawn(game, "Sol Ring", B);
    // A 2/2 (3/2 pumped) fighting a 1/1: 2 excess to it — the reflexive trigger.
    const mine = spawn(game, "Grizzly Bears");
    const elf = spawn(game, "Llanowar Elves", B);
    cast(game, toHand(game, "Rhino's Rampage"), { targets: [ref(mine), ref(elf)] });
    expect(zone(game, relic)).toBe("graveyard");
    // A 1/1 (2/1 pumped) fighting a 6/4: the excess is all dealt to our
    // creature — nothing.
    const relic2 = spawn(game, "Mind Stone", B);
    const small = spawn(game, "Llanowar Elves");
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Rhino's Rampage"), { targets: [ref(small), ref(wurm)] });
    expect(zone(game, relic2)).toBe("battlefield");
    expect(zone(game, small)).toBe("graveyard");
  });
});
