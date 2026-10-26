/**
 * Exodus, group E. One test per card, on its riskiest clause.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Spike Weaver", () => {
  it("enters with three counters and spends one to Fog the turn", () => {
    const { game, a } = table();
    const weaver = enter(game, "Spike Weaver");
    expect(counters(game, weaver)).toBe(3);
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    activate(game, weaver, 1);
    expect(counters(game, weaver)).toBe(2);
    attack(game, a, [bear]);
    expect(life(game, B)).toBe(20);
  });
});

describe("Plaguebearer", () => {
  it("destroys a nonblack creature whose mana value is X", () => {
    const { game } = table();
    const pb = spawn(game, "Plaguebearer");
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 5);
    activate(game, pb, 0, { x: 2, targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("graveyard");
  });

  it("can't target a creature of another mana value", () => {
    const { game } = table();
    const pb = spawn(game, "Plaguebearer");
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    expect(() => activate(game, pb, 0, { x: 1, targets: [ref(bear)] })).toThrow();
  });
});

describe("Grollub", () => {
  it("gives each opponent life equal to the damage it's dealt", () => {
    const { game } = table();
    const grollub = spawn(game, "Grollub");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(grollub)] });
    expect(zone(game, grollub)).toBe("battlefield");
    expect(life(game, B)).toBe(22);
    expect(life(game, A)).toBe(20);
  });
});

describe("Cunning", () => {
  it("is sacrificed at the cleanup after the enchanted creature attacks", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    const aura = toHand(game, "Cunning");
    cast(game, aura, { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 5 });
    attack(game, a, [bear]);
    expect(life(game, B)).toBe(15);
    expect(zone(game, aura)).toBe("battlefield");
    nextTurn(game);
    expect(graveyard(game, A)).toContain(aura);
  });
});

describe("Paroxysm", () => {
  it("destroys the creature when its controller reveals a land", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Paroxysm"), { targets: [ref(bear)] });
    nextTurn(game); // bob's upkeep: the top of his Wastes library is a land
    expect(zone(game, bear)).toBe("graveyard");
  });

  it("pumps it +3/+3 when the revealed card isn't a land", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Paroxysm"), { targets: [ref(bear)] });
    toLibrary(game, "Grizzly Bears", B);
    nextTurn(game);
    expect(zone(game, bear)).toBe("battlefield");
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 5 });
  });

  it("doesn't trigger on the Aura controller's own upkeep", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Paroxysm"), { targets: [ref(bear)] });
    toLibrary(game, "Grizzly Bears", B);
    nextTurn(game);
    nextTurn(game); // alice's upkeep: her Wastes top would destroy it if it triggered
    expect(zone(game, bear)).toBe("battlefield");
  });
});

describe("Death's Duet", () => {
  it("returns two creature cards from your graveyard to your hand", () => {
    const { game } = table();
    const one = toGraveyard(game, "Grizzly Bears");
    const two = toGraveyard(game, "Plaguebearer");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Death's Duet"), { targets: [ref(one), ref(two)] });
    expect(hand(game, A)).toContain(one);
    expect(hand(game, A)).toContain(two);
  });
});
