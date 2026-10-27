/**
 * Onslaught (ONS) group E: Elvish Pioneer's land from hand, Starlit
 * Sanctum's Cleric sacrifices, Reckless One's and Doubtless One's
 * battlefield-wide counts, Slice and Dice's cycle trigger, Weird Harvest's
 * each-player search for X, Tribal Unity's chosen-type +X/+X, Ixidor's Will's
 * per-Wizard tax, and Fever Charm's Wizard-only mode.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
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
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Elvish Pioneer", () => {
  it("puts a basic land from hand onto the battlefield tapped", () => {
    const { game, a } = table();
    const forest = toHand(game, "Forest");
    pickModes(a, 0);
    pickFromZone(a, forest);
    enter(game, "Elvish Pioneer");
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });
});

describe("Starlit Sanctum", () => {
  it("gains the sacrificed Cleric's toughness, or drains its power", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    const sanctum = spawn(game, "Starlit Sanctum");
    const matron = spawn(game, "Abbey Matron"); // 1/3 Cleric
    game.dispatch({ type: "activate-ability", player: A, source: sanctum, abilityIndex: 1, targets: [], sacrifice: matron });
    settle(game);
    expect(zone(game, matron)).toBe("graveyard");
    expect(life(game, A)).toBe(23);

    const second = spawn(game, "Starlit Sanctum");
    const matron2 = spawn(game, "Abbey Matron");
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: second,
      abilityIndex: 2,
      targets: [ref(B)],
      sacrifice: matron2,
    });
    settle(game);
    expect(life(game, B)).toBe(19);
  });
});

describe("Reckless One and Doubtless One", () => {
  it("count every Goblin / Cleric on the battlefield, an opponent's too", () => {
    const { game } = table();
    const reckless = spawn(game, "Reckless One");
    spawn(game, "Raging Goblin", B);
    expect(pt(game, reckless)).toEqual({ power: 2, toughness: 2 });
    const doubtless = spawn(game, "Doubtless One");
    spawn(game, "Abbey Matron", B);
    spawn(game, "Abbey Matron", A);
    expect(pt(game, doubtless)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Slice and Dice", () => {
  it("cycled, may deal 1 damage to each creature", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const goblin = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Slice and Dice");
    pickModes(a, 0);
    game.dispatch({ type: "cycle", player: A, card });
    settle(game);
    expect(zone(game, goblin)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(1);
  });
});

describe("Weird Harvest", () => {
  it("each player searches for up to X creature cards", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 4);
    const mine1 = toLibrary(game, "Grizzly Bears");
    const mine2 = toLibrary(game, "Hill Giant");
    const theirs = toLibrary(game, "Raging Goblin", B);
    pickModes(a, 0);
    pickModes(b, 0);
    const seen = pickFromZone(a, mine1, mine2);
    pickFromZone(b, theirs);
    cast(game, toHand(game, "Weird Harvest"), { x: 2 });
    expect(zone(game, mine1)).toBe("hand");
    expect(zone(game, mine2)).toBe("hand");
    expect(zone(game, theirs)).toBe("hand");
    expect(seen.offered).toContain(mine1);
  });
});

describe("Tribal Unity", () => {
  it("gives creatures of the chosen type +X/+X", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin");
    a.chooseCreatureTypeFn = () => "Bear";
    cast(game, toHand(game, "Tribal Unity"), { x: 3 });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, goblin)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Ixidor's Will", () => {
  it("counters unless {2} per Wizard is paid — an opponent's Wizard counts", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 3);
    spawn(game, "Prodigal Sorcerer", B);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    cast(game, toHand(game, "Ixidor's Will"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Fever Charm", () => {
  it("its damage mode targets only a Wizard creature", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const wizard = spawn(game, "Prodigal Sorcerer", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const charm = toHand(game, "Fever Charm");
    const before = hand(game).length;
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: charm, targets: [ref(bears)], modes: [2] }),
    ).not.toBeNull();
    cast(game, charm, { modes: [2], targets: [ref(wizard)] });
    expect(zone(game, wizard)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1);
    expect(graveyard(game)).toContain(charm);
  });

  it("its pump mode gives +2/+0", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    cast(game, toHand(game, "Fever Charm"), { modes: [1], targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });
});
