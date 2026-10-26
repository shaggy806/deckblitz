/**
 * Gatecrash (GTC; B176), group A. One test per card whose behaviour is more
 * than a stat line or an already-tested pattern, on the clause most likely
 * to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  graveyard,
  keywords,
  lands,
  life,
  named,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  types,
  zone,
} from "./harness.js";
import type { BlockOffer } from "./harness.js";

const canBlock = (offer: BlockOffer, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("Immortal Servitude", () => {
  it("returns each creature card with mana value X, and only those", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const otherBears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    lands(game, "Plains", 5);
    cast(game, toHand(game, "Immortal Servitude"), { x: 2 });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, otherBears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Spell Rupture", () => {
  it("counters a spell whose controller can't pay the greatest power among the caster's creatures", () => {
    const { game } = table();
    spawn(game, "Hill Giant");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    lands(game, "Island", 2);
    cast(game, toHand(game, "Spell Rupture"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Undercity Informer", () => {
  it("mills the target player down to and including the first land", () => {
    const { game } = table();
    const informer = spawn(game, "Undercity Informer");
    const fodder = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    const top = [toLibrary(game, "Grizzly Bears", B), toLibrary(game, "Hill Giant", B)];
    const before = graveyard(game, B).length;
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: informer,
      abilityIndex: 0,
      targets: [ref(B)],
      sacrifice: fodder,
    });
    settle(game);
    expect(zone(game, fodder)).toBe("graveyard");
    for (const card of top) expect(zone(game, card)).toBe("graveyard");
    // The two creatures and the Wastes that stopped it.
    expect(graveyard(game, B).length - before).toBe(3);
  });
});

describe("Mystic Genesis", () => {
  it("makes an Ooze the size of the countered spell's mana value, its X included", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const fireball = toHand(game, "Fireball");
    cast(game, fireball, { x: 3, targets: [ref(B)], settle: false });
    lands(game, "Forest", 3);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Mystic Genesis"), { targets: [ref(fireball)] });
    expect(zone(game, fireball)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    const [ooze] = named(game, "Ooze Token (Convert to Slime)", A);
    expect(ooze).toBeDefined();
    expect(pt(game, ooze)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Five-Alarm Fire", () => {
  it("gets a blaze counter per creature that deals combat damage, and spends five for 5 damage", () => {
    const { game, a } = table();
    const fire = spawn(game, "Five-Alarm Fire");
    const attackers = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    attack(game, a, attackers);
    expect(counters(game, fire, "blaze")).toBe(2);
    game.state.objects[fire].counters.blaze = 5;
    const before = life(game, B);
    activate(game, fire, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(before - 5);
    expect(counters(game, fire, "blaze")).toBe(0);
  });
});

describe("Smog Elemental", () => {
  it("shrinks only the fliers its controller's opponents control", () => {
    const { game } = table();
    spawn(game, "Smog Elemental");
    const theirFlier = spawn(game, "Serra Angel", B);
    const theirBears = spawn(game, "Grizzly Bears", B);
    const ourFlier = spawn(game, "Serra Angel");
    expect(pt(game, theirFlier)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirBears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, ourFlier)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Firefist Striker", () => {
  it("with two other attackers, makes the target creature unable to block", () => {
    const { game, a } = table();
    const striker = spawn(game, "Firefist Striker");
    const others = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const wall = spawn(game, "Hill Giant", B);
    const free = spawn(game, "Hill Giant", B);
    pickTargets(a, wall);
    const offer = blockOffer(game, a, [striker, ...others]);
    expect(canBlock(offer, wall)).toEqual([]);
    expect(canBlock(offer, free).length).toBe(3);
  });
});

describe("Greenside Watcher", () => {
  it("untaps a target Gate", () => {
    const { game } = table();
    const watcher = spawn(game, "Greenside Watcher");
    const gate = spawn(game, "Azorius Guildgate", A, { tapped: true });
    activate(game, watcher, 0, { targets: [ref(gate)] });
    expect(game.state.objects[gate].tapped).toBe(false);
  });
});

describe("Hydroform", () => {
  it("makes any land a 3/3 flying Elemental creature that's still a land", () => {
    const { game } = table();
    const theirs = spawn(game, "Wastes", B);
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Hydroform"), { targets: [ref(theirs)] });
    expect(types(game, theirs)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, theirs).has("flying")).toBe(true);
  });
});
