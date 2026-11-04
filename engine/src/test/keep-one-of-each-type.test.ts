/**
 * `choose-one-of-each` over the permanent types, past Cataclysm's: Liliana,
 * Dreadhorde General's six types and only her opponents; Cataclysmic Gearhulk's
 * nonland permanents, lands neither chosen nor sacrificed; Mythos of Snapdax's
 * `chosenBy`, the caster answering for every player when {B}{R} was spent.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  cast,
  counters,
  hand,
  lands,
  loyalty,
  named,
  pickPermanents,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Liliana, Dreadhorde General", () => {
  it("−9: each opponent keeps one of each type in turn order, you keep everything, and the rest go at once", () => {
    const { game, a, b, c } = table({ players: 3 });
    const mine = spawn(game, "Grizzly Bears", A);
    const myLions = spawn(game, "Savannah Lions", A);
    const lili = spawn(game, "Liliana, Dreadhorde General", A);
    const bForest = spawn(game, "Forest", B);
    const bMountain = spawn(game, "Mountain", B);
    const bThopter = spawn(game, "Ornithopter", B); // artifact creature
    const bBears = spawn(game, "Grizzly Bears", B);
    const bAnthem = spawn(game, "Glorious Anthem", B);
    const bJace = spawn(game, "Jace Beleren", B);
    const cIsland = spawn(game, "Island", C);
    const cLions = spawn(game, "Savannah Lions", C);
    const cOgre = spawn(game, "Gray Ogre", C);
    const asked: string[] = [];
    a.choosePermanentsFn = () => {
      throw new Error("Alice isn't an opponent");
    };
    b.choosePermanentsFn = (_view, eligible) => {
      asked.push("b");
      expect(eligible).toEqual(expect.arrayContaining([bForest, bThopter, bAnthem, bJace]));
      expect(eligible).not.toContain(cLions);
      return [bForest, bThopter, bAnthem, bJace];
    };
    c.choosePermanentsFn = (_view, eligible) => {
      asked.push("c");
      expect(eligible).not.toContain(bBears);
      return [cIsland, cLions];
    };

    loyalty(game, lili, -9, { atLeast: 10 });

    expect(asked).toEqual(["b", "c"]);
    for (const kept of [mine, myLions, lili, bForest, bThopter, bAnthem, bJace, cIsland, cLions]) {
      expect(zone(game, kept)).toBe("battlefield");
    }
    for (const gone of [bMountain, bBears, cOgre]) expect(zone(game, gone)).toBe("graveyard");
    expect(counters(game, lili, "loyalty")).toBe(1);
  });

  it("a battle is a permanent type of its own", () => {
    const { game, b } = table();
    const lili = spawn(game, "Liliana, Dreadhorde General", A);
    const forest = spawn(game, "Forest", B);
    const kept = spawn(game, "Invasion of Zendikar", B);
    const gone = spawn(game, "Invasion of Vryn", B);
    const seen = pickPermanents(b, forest, kept);
    loyalty(game, lili, -9, { atLeast: 10 });
    expect(seen.offered).toContain(kept);
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, kept)).toBe("battlefield");
    expect(zone(game, gone)).toBe("graveyard");
  });

  it("draws a card for each creature you control that dies, and −4 takes two from each player", () => {
    const { game, a, b } = table();
    const lili = spawn(game, "Liliana, Dreadhorde General", A);
    const mine = [spawn(game, "Grizzly Bears", A), spawn(game, "Savannah Lions", A), spawn(game, "Gray Ogre", A)];
    const theirs = [spawn(game, "Hill Giant", B), spawn(game, "Grizzly Bears", B)];
    pickPermanents(a, mine[0], mine[1]);
    pickPermanents(b, ...theirs);
    const before = hand(game, A).length;
    const opponentBefore = hand(game, B).length;

    loyalty(game, lili, -4);

    expect(zone(game, mine[0])).toBe("graveyard");
    expect(zone(game, mine[1])).toBe("graveyard");
    expect(zone(game, mine[2])).toBe("battlefield");
    for (const id of theirs) expect(zone(game, id)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before + 2);
    expect(hand(game, B).length).toBe(opponentBefore);
    expect(counters(game, lili, "loyalty")).toBe(2);
  });

  it("+1 makes a 2/2 Zombie", () => {
    const { game } = table();
    const lili = spawn(game, "Liliana, Dreadhorde General", A);
    loyalty(game, lili, 1);
    expect(named(game, "Zombie Token", A)).toHaveLength(1);
    expect(counters(game, lili, "loyalty")).toBe(7);
  });
});

describe("Cataclysmic Gearhulk", () => {
  it("a land stays whatever else it is, and the Gearhulk goes unless chosen", () => {
    const { game, a, b } = table();
    const plains = lands(game, "Plains", 5);
    const citadel = spawn(game, "Darksteel Citadel", A); // an artifact land
    const thopter = spawn(game, "Ornithopter", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const anthem = spawn(game, "Glorious Anthem", A);
    const giant = spawn(game, "Hill Giant", B);
    const ogre = spawn(game, "Gray Ogre", B);
    const mountain = spawn(game, "Mountain", B);
    const gearhulk = toHand(game, "Cataclysmic Gearhulk");
    let offered: readonly ObjectId[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      offered = eligible;
      return [thopter, bears, anthem];
    };
    pickPermanents(b, giant);

    cast(game, gearhulk);

    expect(offered).not.toContain(citadel);
    expect(offered).toContain(gearhulk);
    for (const kept of [thopter, bears, anthem, giant, citadel, mountain, ...plains]) {
      expect(zone(game, kept)).toBe("battlefield");
    }
    expect(zone(game, ogre)).toBe("graveyard");
    expect(zone(game, gearhulk)).toBe("graveyard");
  });

  it("may be the artifact and the creature both", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    const bears = spawn(game, "Grizzly Bears", A);
    const gearhulk = toHand(game, "Cataclysmic Gearhulk");
    pickPermanents(a, gearhulk);
    cast(game, gearhulk);
    expect(zone(game, gearhulk)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Mythos of Snapdax", () => {
  const board = (game: Game) => ({
    bears: spawn(game, "Grizzly Bears", A),
    lions: spawn(game, "Savannah Lions", A),
    giant: spawn(game, "Hill Giant", B),
    ogre: spawn(game, "Gray Ogre", B),
    mountain: spawn(game, "Mountain", B),
  });

  it("without {B}{R}, each player chooses their own", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 4);
    const { bears, lions, giant, ogre, mountain } = board(game);
    pickPermanents(a, lions);
    pickPermanents(b, giant);
    cast(game, toHand(game, "Mythos of Snapdax"));
    for (const kept of [lions, giant, mountain]) expect(zone(game, kept)).toBe("battlefield");
    for (const gone of [bears, ogre]) expect(zone(game, gone)).toBe("graveyard");
  });

  it("with {B}{R}, you choose for each player, one at a time, and they aren't asked", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 2);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    const { bears, lions, giant, ogre, mountain } = board(game);
    const offers: (readonly ObjectId[])[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      offers.push(eligible);
      return eligible.includes(lions) ? [lions] : [ogre];
    };
    b.choosePermanentsFn = () => {
      throw new Error("Bob isn't asked");
    };
    cast(game, toHand(game, "Mythos of Snapdax"));
    expect(offers).toHaveLength(2);
    expect(offers[0]).toContain(lions);
    expect(offers[0]).not.toContain(giant);
    expect(offers[1]).toContain(giant);
    expect(offers[1]).not.toContain(lions);
    for (const kept of [lions, ogre, mountain]) expect(zone(game, kept)).toBe("battlefield");
    for (const gone of [bears, giant]) expect(zone(game, gone)).toBe("graveyard");
  });

  it("your choices for them must still be legal (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    const { lions, giant, ogre } = board(game);
    const refusals: (string | null)[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      if (eligible.includes(lions)) return [lions];
      refusals.push(
        game.canDispatch({ type: "choose-permanents", player: A, permanents: [] }),
        game.canDispatch({ type: "choose-permanents", player: A, permanents: [giant, ogre] }),
        game.canDispatch({ type: "choose-permanents", player: A, permanents: [giant] }),
      );
      return [giant];
    };
    cast(game, toHand(game, "Mythos of Snapdax"));
    expect(refusals[0]).not.toBeNull();
    expect(refusals[1]).not.toBeNull();
    expect(refusals[2]).toBeNull();
  });
});
