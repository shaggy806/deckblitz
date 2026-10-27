/**
 * Urza's Destiny's rest, Starter 1999 and Mercadian Masques (B227), group A.
 * One test per card whose behaviour is more than a stat line, on the clause
 * most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
  destroy,
} from "./harness.js";

describe("Scent of Nightshade", () => {
  it("gives -X/-X for the black cards revealed", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const giant = spawn(game, "Hill Giant", B);
    const black = [toHand(game, "Vendetta"), toHand(game, "Undertaker")];
    pickFromZone(a, ...black);
    cast(game, toHand(game, "Scent of Nightshade"), { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
    expect(zone(game, black[0])).toBe("hand");
  });
});

describe("Nightshade Seer", () => {
  it("kills a creature with toughness equal to the black cards revealed", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const seer = spawn(game, "Nightshade Seer");
    const bears = spawn(game, "Grizzly Bears", B);
    const black = [toHand(game, "Vendetta"), toHand(game, "Undertaker")];
    pickFromZone(a, ...black);
    activate(game, seer, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Vendetta", () => {
  it("destroys a nonblack creature and you lose life equal to its toughness", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Vendetta"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, A)).toBe(17);
  });
});

describe("Puppet's Verdict", () => {
  it("destroys either the small creatures or the big ones, never both", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Puppet's Verdict"));
    const dead = [zone(game, bears), zone(game, giant)].filter((z) => z === "graveyard");
    expect(dead).toHaveLength(1);
  });
});

describe("Goblin Masons", () => {
  it("destroys target Wall when it dies", () => {
    const { game, a } = table();
    const masons = spawn(game, "Goblin Masons");
    const wall = spawn(game, "Wall of Stone", B);
    pickTargets(a, wall);
    destroy(game, masons);
    settle(game);
    expect(zone(game, wall)).toBe("graveyard");
  });
});

describe("Undertaker", () => {
  it("discards a card to return a creature card from your graveyard to hand", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const undertaker = spawn(game, "Undertaker");
    const bears = toGraveyard(game, "Grizzly Bears");
    const before = hand(game, A).length;
    activate(game, undertaker, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    // One card discarded, one returned.
    expect(hand(game, A)).toHaveLength(before);
  });
});

describe("Distorting Lens", () => {
  it("turns target permanent the chosen colour", () => {
    const { game, a } = table();
    const lens = spawn(game, "Distorting Lens");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 2);
    activate(game, lens, 0, { targets: [ref(bears)] });
    expect([...computeCharacteristics(game.state, registryOf(game), bears).colors]).toEqual(["B"]);
  });
});

describe("Larceny", () => {
  it("makes the damaged player discard once per creature", () => {
    const { game, a } = table();
    spawn(game, "Larceny");
    const attackers = [spawn(game, "Grizzly Bears"), spawn(game, "Hill Giant")];
    const before = hand(game, B).length;
    attack(game, a, attackers);
    expect(hand(game, B)).toHaveLength(before - 2);
  });
});

describe("Shrieking Specter", () => {
  it("makes the defending player discard when it attacks", () => {
    const { game, a } = table();
    const specter = spawn(game, "Shrieking Specter");
    const before = hand(game, B).length;
    attack(game, a, [specter]);
    expect(hand(game, B)).toHaveLength(before - 1);
  });
});

describe("Enslaved Horror", () => {
  it("lets each opponent return a creature card from their own graveyard", () => {
    const { game, b } = table();
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const mine = toGraveyard(game, "Hill Giant", A);
    pickModes(b, 0);
    pickFromZone(b, theirs);
    enter(game, "Enslaved Horror");
    expect(zone(game, theirs)).toBe("battlefield");
    expect(game.state.objects[theirs].controller).toBe(B);
    expect(zone(game, mine)).toBe("graveyard");
    expect(graveyard(game, A)).toContain(mine);
  });
});

describe("Rishadan Cutpurse", () => {
  it("makes an opponent who can't pay {1} sacrifice a permanent", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Rishadan Cutpurse");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("spares an opponent who pays {1}", () => {
    const { game, b } = table();
    const [island] = lands(game, "Island", 1, B);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b, 0);
    enter(game, "Rishadan Cutpurse");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, island)).toBe("battlefield");
    expect(game.state.objects[island].tapped).toBe(true);
  });
});
